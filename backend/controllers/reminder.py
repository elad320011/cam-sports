from flask import jsonify, current_app
from datetime import datetime

def list_scheduled_reminders():
    try:
        scheduler = current_app.apscheduler
        jobs = scheduler.get_jobs()
        
        # Filter for payment reminder jobs
        reminder_jobs = [
            {
                "job_id": job.id,
                "payment_id": job.id.split('_')[2],  # Extract payment_id from job_id
                "reminder_date": job.next_run_time.isoformat() if job.next_run_time else None,
                "status": "active" if job.next_run_time else "completed"
            }
            for job in jobs
            if job.id.startswith("payment_reminder_")
        ]
        
        return jsonify({
            "scheduled_reminders": reminder_jobs
        }), 200
        
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500 
