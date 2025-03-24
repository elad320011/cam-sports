from flask import jsonify, request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration: update with the path to your service account JSON file
SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    # If needed, delegate domain-wide access:
    # creds = creds.with_subject('user@example.com')
    service = build('calendar', 'v3', credentials=creds)
    return service

def create_team_calendar():
    try:
        data = request.get_json()
        if not data or "summary" not in data:
            return jsonify({"status": "error", "message": "Missing 'summary' field"}), 400
        
        calendar_body = {
            "summary": data["summary"],
            "timeZone": data.get("timeZone", "UTC")
        }
        service = get_calendar_service()
        created_calendar = service.calendars().insert(body=calendar_body).execute()
        return jsonify({"status": "success", "calendar": created_calendar}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def get_team_calendar():
    try:
        calendar_id = request.args.get("calendar_id")
        if not calendar_id:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' parameter"}), 400
        
        service = get_calendar_service()
        calendar = service.calendars().get(calendarId=calendar_id).execute()
        print(calendar)
        return jsonify({"status": "success", "calendar": calendar}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Calendar not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def list_team_calendars():
    try:
        service = get_calendar_service()
        calendar_list_result = service.calendarList().list().execute()
        calendars = calendar_list_result.get('items', [])
        return jsonify({"status": "success", "calendars": calendars}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
def delete_team_calendar():
    try:
        data = request.get_json()
        if not data or "calendar_id" not in data:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' field"}), 400

        calendar_id = data["calendar_id"]
        service = get_calendar_service()
        service.calendars().delete(calendarId=calendar_id).execute()
        return jsonify({"status": "success", "message": f"Calendar {calendar_id} deleted"}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Calendar not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500