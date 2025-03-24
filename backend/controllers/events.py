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