from flask import jsonify, request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import datetime

# Configuration: Update the path to your service account key file
SERVICE_ACCOUNT_FILE = 'credentials.json'
SCOPES = ['https://www.googleapis.com/auth/calendar']

# def get_calendar_service():
#     creds = service_account.Credentials.from_service_account_file(
#         SERVICE_ACCOUNT_FILE, scopes=SCOPES)
#     return build('calendar', 'v3', credentials=creds)

def get_calendar_service(user_email: str = None):
    """
    Returns a Google Calendar service instance.
    If user_email is provided, impersonates that user.
    Otherwise, uses the service account's own credentials.
    """
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    if user_email:
        creds = creds.with_subject(user_email)
    return build('calendar', 'v3', credentials=creds)


def create_event():
    try:
        data = request.get_json()
        
        required_fields = ["calendar_id", "summary", "start", "end"]
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing '{field}' field"}), 400

        calendar_id = data["calendar_id"]

        if "T" in data["start"]:
            start_field = {"dateTime": data["start"]}
        else:
            start_field = {"date": data["start"]}

        if "T" in data["end"]:
            end_field = {"dateTime": data["end"]}
        else:
            end_field = {"date": data["end"]}

        event_body = {
            "summary": data["summary"],
            "description": data.get("description", ""),
            "start": start_field,
            "end": end_field,
        }

        service = get_calendar_service()
        created_event = service.events().insert(calendarId=calendar_id, body=event_body).execute()

        return jsonify({"status": "success", "event": created_event}), 201
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Calendar not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def get_event():
    try:
        calendar_id = request.args.get("calendar_id")
        event_id = request.args.get("event_id")
        if not calendar_id or not event_id:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' or 'event_id' parameter"}), 400

        service = get_calendar_service()
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()
        return jsonify({"status": "success", "event": event}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def list_events():
    try:
        calendar_id = request.args.get("calendar_id")
        if not calendar_id:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' parameter"}), 400
        
        service = get_calendar_service()
        # now = datetime.datetime.utcnow().isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId=calendar_id,
            # timeMin=now,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])

        return jsonify({"status": "success", "events": events}), 200
    
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Calendar not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def update_event():
    try:
        data = request.get_json()
        if not data or "calendar_id" not in data or "event_id" not in data:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' or 'event_id' in request"}), 400
        
        calendar_id = data["calendar_id"]
        event_id = data["event_id"]
        service = get_calendar_service()
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()

        # Update provided fields
        if "summary" in data:
            event["summary"] = data["summary"]
        if "description" in data:
            event["description"] = data["description"]
        if "start" in data:
            event["start"]["dateTime"] = data["start"]
        if "end" in data:
            event["end"]["dateTime"] = data["end"]

        updated_event = service.events().update(calendarId=calendar_id, eventId=event_id, body=event).execute()
        return jsonify({"status": "success", "event": updated_event}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def delete_event():
    try:
        data = request.get_json()
        if not data or "calendar_id" not in data or "event_id" not in data:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' or 'event_id' field"}), 400
        calendar_id = data["calendar_id"]
        event_id = data["event_id"]
        service = get_calendar_service()
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        return jsonify({"status": "success", "message": f"Event {event_id} deleted from calendar {calendar_id}"}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# --------------------------------------
# RSVP 
# --------------------------------------

def rsvp_event():
    try:
        data = request.get_json()
        for field in ['calendar_id', 'event_id', 'email']:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing '{field}' field"}), 400
        
        calendar_id = data['calendar_id']
        event_id = data['event_id']
        email = data['email']
        status = data.get('status', 'accepted')

        # service = get_calendar_service()
        service = get_calendar_service(email)

        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()
        print(event)
        print("1")
        attendees = event.get('attendees', [])
        attendee_found = False
        for attendee in attendees:
            if attendee.get('email', '').lower() == email.lower():
                attendee['responseStatus'] = status
                attendee_found = True
                break

        if not attendee_found:
            attendees.append({'email': email, 'responseStatus': status})
        
        event['attendees'] = attendees
        
        print(event)
        # service = get_calendar_service(email)

        updated_event = service.events().update(
            calendarId=calendar_id,
            eventId=event_id,
            body=event
        ).execute()

        return jsonify({"status": "success", "event": updated_event}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def show_attendance():
    try:
        calendar_id = request.args.get("calendar_id")
        event_id = request.args.get("event_id")
        if not calendar_id or not event_id:
            return jsonify({"status": "error", "message": "Missing 'calendar_id' or 'event_id' parameter"}), 400

        service = get_calendar_service()
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()
        attendees = event.get('attendees', [])
        return jsonify({"status": "success", "attendees": attendees}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def remove_rsvp():
    try:
        data = request.get_json()
        for field in ['calendar_id', 'event_id', 'email']:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing '{field}' field"}), 400
        calendar_id = data['calendar_id']
        event_id = data['event_id']
        email = data['email']

        service = get_calendar_service()
        event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()
        attendees = event.get('attendees', [])

        # Remove the attendee with the matching email
        new_attendees = [att for att in attendees if att.get('email', '').lower() != email.lower()]
        event['attendees'] = new_attendees

        updated_event = service.events().update(
            calendarId=calendar_id,
            eventId=event_id,
            body=event
        ).execute()

        return jsonify({"status": "success", "event": updated_event}), 200
    except HttpError as err:
        if err.resp.status == 404:
            return jsonify({"status": "error", "message": "Event not found"}), 404
        else:
            return jsonify({"status": "error", "message": err._get_reason()}), err.resp.status
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500