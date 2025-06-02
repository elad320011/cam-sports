from flask import jsonify
import requests
from models.player import Player
from models.management import Management
from models.push_token import PushToken
from models.team import Team
from datetime import datetime
from bson import ObjectId

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

def send_notifications(request):
    try:
        data = request.get_json()
        team_name = data.get('to')  # team name
        title = data.get('title')
        body = data.get('body')
        data_payload = data.get('data', {})

        print(f"Sending notification to team: {team_name}")
        print(f"Title: {title}")
        print(f"Body: {body}")

        if not all([team_name, title, body]):
            return jsonify({'error': 'to, title, and body are required'}), 400

        # Get the team ID from the team name
        team = Team.objects(name=team_name).first()
        if not team:
            print(f"Team not found: {team_name}")
            return jsonify({'error': 'Team not found'}), 404

        team_id = str(team.id)
        print(f"Found team ID: {team_id}")

        # Debug: Print all users in the database
        print("\nAll Players in database:")
        all_players = Player.objects()
        for player in all_players:
            print(f"Player: {player.email}, Team: {player.team_id}, Push Token: {player.push_token}")

        print("\nAll Management in database:")
        all_management = Management.objects()
        for manager in all_management:
            print(f"Manager: {manager.email}, Team: {manager.team_id}, Push Token: {manager.push_token}")

        # Get all team members (both players and management) with their push tokens
        # Try both string and ObjectId formats
        players = Player.objects(team_id__in=[team_id, ObjectId(team_id)])
        management = Management.objects(team_id__in=[team_id, ObjectId(team_id)])
        
        print(f"\nFound {len(players)} players and {len(management)} management members for team {team_name}")
        
        # Debug: Print all players and their push tokens
        print("\nPlayers in team:")
        for player in players:
            print(f"Player: {player.email}, Team: {player.team_id}, Push Token: {player.push_token}")
        
        print("\nManagement in team:")
        for manager in management:
            print(f"Manager: {manager.email}, Team: {manager.team_id}, Push Token: {manager.push_token}")
        
        # Prepare messages for each team member
        messages = []
        
        # Add player notifications
        for player in players:
            if hasattr(player, 'push_token') and player.push_token:
                print(f"Adding notification for player: {player.email}")
                messages.append({
                    'to': player.push_token,
                    'title': title,
                    'body': body,
                    'data': data_payload,
                    'sound': 'default'
                })

        # Add management notifications
        for manager in management:
            if hasattr(manager, 'push_token') and manager.push_token:
                print(f"Adding notification for manager: {manager.email}")
                messages.append({
                    'to': manager.push_token,
                    'title': title,
                    'body': body,
                    'data': data_payload,
                    'sound': 'default'
                })

        print(f"Total messages to send: {len(messages)}")

        # Send the notifications
        tickets = []
        for message in messages:
            try:
                print(f"Sending message to token: {message['to']}")
                response = requests.post(EXPO_PUSH_URL, json=message)
                print(f"Response status: {response.status_code}")
                print(f"Response body: {response.text}")
                if response.status_code == 200:
                    tickets.append(response.json())
            except Exception as e:
                print(f"Error sending notification: {str(e)}")

        return jsonify({
            'message': 'Notifications sent successfully',
            'tickets': tickets
        }), 200

    except Exception as e:
        print(f"Error sending push notification: {str(e)}")
        return jsonify({'error': 'Failed to send push notification'}), 500

def register_notifications(request):
    try:
        data = request.get_json()
        if not data:
            print("No JSON data received in request")
            return jsonify({'error': 'No data provided'}), 400

        token = data.get('token')
        email = data.get('userId')  # Using email as userId

        print(f"\nRegistering push token for email: {email}")
        print(f"Token: {token}")

        if not token:
            print("No token provided")
            return jsonify({'error': 'Token is required'}), 400
        if not email:
            print("No email provided")
            return jsonify({'error': 'Email is required'}), 400

        # Try to find the user in both Player and Management collections
        player = Player.objects(email=email).first()
        manager = Management.objects(email=email).first()

        print(f"Found player: {player is not None}")
        print(f"Found manager: {manager is not None}")

        if not player and not manager:
            print(f"User not found: {email}")
            return jsonify({'error': 'User not found'}), 404

        # Update push token for the found user
        if player:
            print(f"Updating token for player: {email}")
            print(f"Current team_id: {player.team_id}")
            try:
                # Use update_one instead of save
                result = Player.objects(email=email).update_one(set__push_token=token)
                print(f"Update result: {result}")
                if result == 0:
                    print("No document was updated")
                    return jsonify({'error': 'Failed to update push token'}), 500
                print(f"Updated player push token successfully")
            except Exception as e:
                print(f"Error saving player push token: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback
                print(f"Traceback: {traceback.format_exc()}")
                return jsonify({'error': 'Failed to save push token'}), 500
        else:
            print(f"Updating token for manager: {email}")
            print(f"Current team_id: {manager.team_id}")
            try:
                # Use update_one instead of save
                result = Management.objects(email=email).update_one(set__push_token=token)
                print(f"Update result: {result}")
                if result == 0:
                    print("No document was updated")
                    return jsonify({'error': 'Failed to update push token'}), 500
                print(f"Updated manager push token successfully")
            except Exception as e:
                print(f"Error saving manager push token: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback
                print(f"Traceback: {traceback.format_exc()}")
                return jsonify({'error': 'Failed to save push token'}), 500

        # Verify the update
        if player:
            updated_player = Player.objects(email=email).first()
            print(f"Verification - Updated player push token: {updated_player.push_token}")
            if updated_player.push_token != token:
                print("Warning: Push token verification failed for player")
                return jsonify({'error': 'Push token verification failed'}), 500
        else:
            updated_manager = Management.objects(email=email).first()
            print(f"Verification - Updated manager push token: {updated_manager.push_token}")
            if updated_manager.push_token != token:
                print("Warning: Push token verification failed for manager")
                return jsonify({'error': 'Push token verification failed'}), 500

        return jsonify({'message': 'Push token registered successfully'}), 200

    except Exception as e:
        print(f"Error registering push token: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to register push token'}), 500
