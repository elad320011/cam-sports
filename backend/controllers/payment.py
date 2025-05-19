from flask import request, jsonify, current_app
from models.payment import Payment, Reminder
from controllers.message_board_controller import MessageBoardController
import mongoengine as me
from datetime import datetime
from flask_apscheduler import APScheduler

def send_reminder_notification(payment_id: str, reminder_date: datetime):
    """Function to send reminder notification by creating a message in the message board"""
    try:
        payment = Payment.objects(id=payment_id).first()
        if payment:
            # Create message content with payment details
            message_content = f"Payment Reminder:\nAmount: ${payment.amount}\nDue Date: {payment.due_date.strftime('%Y-%m-%d')}\nPayment Link: {payment.link}"
            
            # Add message to the team's message board
            # Note: You'll need to get the team_id from the payment or pass it as a parameter
            team_id = payment.team_id  # Assuming payment has a team_id field
            MessageBoardController.add_message(
                team_id=team_id,
                content=message_content,
                message_type="payment_reminder",
                creator_email="system@camsports.com"  # System-generated message
            )
            
            print(f"Payment reminder message created for payment {payment_id}")
    except Exception as e:
        print(f"Error sending reminder: {str(e)}")

def schedule_reminder(payment_id: str, reminder_date: datetime):
    """Schedule a reminder for a specific payment"""
    scheduler = current_app.apscheduler
    job_id = f"payment_reminder_{payment_id}_{reminder_date.isoformat()}"
    
    # Schedule the reminder
    scheduler.add_job(
        id=job_id,
        func=send_reminder_notification,
        trigger='date',
        run_date=reminder_date,
        args=[payment_id, reminder_date],
        replace_existing=True
    )

def create_payment():
    try:
        data = request.get_json()
        link = data.get('link')
        amount = data.get('amount')
        description = data.get('description')
        due_date = data.get('due_date')
        reminders_data = data.get('reminders', [])
        team_id = data.get('team_id')  # Add team_id to the payment data

        # Validate required fields
        if not all([link, amount, due_date, team_id]):
            return jsonify({"message": "Link, amount, due date, and team_id are required"}), 400

        # Convert due_date string to datetime
        try:
            due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"message": "Invalid due date format"}), 400

        # Create reminders list
        reminders = []
        for reminder_data in reminders_data:
            try:
                reminder_date = datetime.fromisoformat(reminder_data['date'].replace('Z', '+00:00'))
                reminder = Reminder(date=reminder_date)
                reminders.append(reminder)
            except (ValueError, KeyError):
                return jsonify({"message": "Invalid reminder date format"}), 400

        # Create payment
        payment = Payment(
            link=link,
            amount=float(amount),
            description=description,
            due_date=due_date,
            reminders=reminders,
            team_id=team_id  # Add team_id to the payment
        )
        payment.save()

        # Send message to message board about new payment
        message_content = f"New Payment Created:\nAmount: ${payment.amount}\nDue Date: {payment.due_date.strftime('%Y-%m-%d')}\nPayment Link: {payment.link}"
        if description:
            message_content += f"\nDescription: {description}"
        
        MessageBoardController.add_message(
            team_id=team_id,
            content=message_content,
            message_type="payment_created",
            creator_email="system@camsports.com"
        )

        # Schedule reminders
        for reminder in payment.reminders:
            schedule_reminder(str(payment.id), reminder.date)

        # Prepare the response data
        result = {
            "id": str(payment.id),
            "link": payment.link,
            "amount": payment.amount,
            "description": payment.description,
            "due_date": payment.due_date.isoformat(),
            "team_id": payment.team_id,
            "reminders": [
                {
                    "date": reminder.date.isoformat(),
                    "created_at": reminder.created_at.isoformat(),
                    "updated_at": reminder.updated_at.isoformat()
                }
                for reminder in payment.reminders
            ],
            "created_at": payment.created_at.isoformat(),
            "updated_at": payment.updated_at.isoformat()
        }

        return jsonify(result), 201

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def edit_payment(payment_id: str):
    try:
        data = request.get_json()
        payment = Payment.objects(id=payment_id).first()

        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        # Track changes for message notification
        changes = []
        
        # Update basic payment information
        if 'link' in data:
            payment.link = data['link']
        if 'amount' in data:
            old_amount = payment.amount
            payment.amount = float(data['amount'])
            if old_amount != payment.amount:
                changes.append(f"Amount changed from ${old_amount} to ${payment.amount}")
        if 'description' in data:
            old_description = payment.description
            payment.description = data['description']
            if old_description != payment.description:
                changes.append(f"Description updated: {payment.description}")
        if 'due_date' in data:
            try:
                due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                payment.due_date = due_date
            except ValueError:
                return jsonify({"message": "Invalid due date format"}), 400

        # Handle reminders update
        if 'reminders' in data:
            # Remove existing reminders
            payment.reminders = []
            
            # Add new reminders
            for reminder_data in data['reminders']:
                try:
                    reminder_date = datetime.fromisoformat(reminder_data['date'].replace('Z', '+00:00'))
                    reminder = Reminder(date=reminder_date)
                    payment.reminders.append(reminder)
                except (ValueError, KeyError):
                    return jsonify({"message": "Invalid reminder date format"}), 400

        # Save the updated payment
        payment.save()

        # Send message to message board if there were changes
        if changes:
            message_content = f"Payment Updated:\nPayment Link: {payment.link}\nDue Date: {payment.due_date.strftime('%Y-%m-%d')}\n\nChanges made:\n" + "\n".join(changes)
            
            MessageBoardController.add_message(
                team_id=payment.team_id,
                content=message_content,
                message_type="payment_updated",
                creator_email="system@camsports.com"
            )

        # Reschedule reminders
        scheduler = current_app.apscheduler
        
        # Remove existing scheduled reminders
        for job in scheduler.get_jobs():
            if job.id.startswith(f"payment_reminder_{payment_id}"):
                scheduler.remove_job(job.id)

        # Schedule new reminders
        for reminder in payment.reminders:
            schedule_reminder(str(payment.id), reminder.date)

        # Prepare the response data
        result = {
            "id": str(payment.id),
            "link": payment.link,
            "amount": payment.amount,
            "description": payment.description,
            "due_date": payment.due_date.isoformat(),
            "team_id": payment.team_id,
            "reminders": [
                {
                    "date": reminder.date.isoformat(),
                    "created_at": reminder.created_at.isoformat(),
                    "updated_at": reminder.updated_at.isoformat()
                }
                for reminder in payment.reminders
            ],
            "created_at": payment.created_at.isoformat(),
            "updated_at": payment.updated_at.isoformat()
        }

        return jsonify(result), 200

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def delete_payment(payment_id: str):
    try:
        payment = Payment.objects(id=payment_id).first()

        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        # Remove all scheduled reminders for this payment
        scheduler = current_app.apscheduler
        for job in scheduler.get_jobs():
            if job.id.startswith(f"payment_reminder_{payment_id}"):
                scheduler.remove_job(job.id)

        # Delete the payment
        payment.delete()

        return jsonify({"message": "Payment and associated reminders deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def list_payments():
    try:
        team_id = request.args.get('team_id')
        payment_id = request.args.get('payment_id')
        
        if payment_id:
            # If payment_id is provided, return just that payment
            payment = Payment.objects(id=payment_id).first()
            if not payment:
                return jsonify({"message": "Payment not found"}), 404
                
            result = {
                "id": str(payment.id),
                "link": payment.link,
                "amount": payment.amount,
                "description": payment.description,
                "due_date": payment.due_date.isoformat(),
                "team_id": payment.team_id,
                "reminders": [
                    {
                        "date": reminder.date.isoformat(),
                        "created_at": reminder.created_at.isoformat(),
                        "updated_at": reminder.updated_at.isoformat()
                    }
                    for reminder in payment.reminders
                ],
                "created_at": payment.created_at.isoformat(),
                "updated_at": payment.updated_at.isoformat()
            }
            return jsonify(result), 200
            
        # If no payment_id, return all payments for the team
        if not team_id:
            return jsonify({"message": "Team ID is required"}), 400

        # Query payments for the team
        payments = Payment.objects(team_id=team_id).order_by('-created_at')

        # Format the response
        result = {
            "payments": [
                {
                    "id": str(payment.id),
                    "link": payment.link,
                    "amount": payment.amount,
                    "description": payment.description,
                    "due_date": payment.due_date.isoformat(),
                    "team_id": payment.team_id,
                    "reminders": [
                        {
                            "date": reminder.date.isoformat(),
                            "created_at": reminder.created_at.isoformat(),
                            "updated_at": reminder.updated_at.isoformat()
                        }
                        for reminder in payment.reminders
                    ],
                    "created_at": payment.created_at.isoformat(),
                    "updated_at": payment.updated_at.isoformat()
                }
                for payment in payments
            ]
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def get_payment(payment_id: str):
    try:
        payment = Payment.objects(id=payment_id).first()

        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        # Format the response
        result = {
            "id": str(payment.id),
            "link": payment.link,
            "amount": payment.amount,
            "description": payment.description,
            "due_date": payment.due_date.isoformat(),
            "team_id": payment.team_id,
            "reminders": [
                {
                    "date": reminder.date.isoformat(),
                    "created_at": reminder.created_at.isoformat(),
                    "updated_at": reminder.updated_at.isoformat()
                }
                for reminder in payment.reminders
            ],
            "created_at": payment.created_at.isoformat(),
            "updated_at": payment.updated_at.isoformat()
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
