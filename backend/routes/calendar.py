from flask import Blueprint, request
from controllers.calendar import get_team_calendar, list_team_calendars, create_team_calendar, delete_team_calendar 
# from controllers.events import #list_events, get_event_by_id, create_event, rsvp, delete_event, create_calendar #, get_calendar_by_id

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/create_team_calendar', methods=['POST'])
def create_team_calendar_route():
    return create_team_calendar()

@calendar_bp.route('/get_team_calendar', methods=['GET'])
def get_team_calendar_route():
    return get_team_calendar()

@calendar_bp.route('/list_team_calendars', methods=['GET'])
def list_team_calendars_route():
    return list_team_calendars()

@calendar_bp.route('/delete_team_calendar', methods=['DELETE'])
def delete_team_calendar_route():
    return delete_team_calendar()

# @calendar_bp.route('/list_events', methods=['GET'])
# def list_events_route():
#     return list_events()

# @calendar_bp.route('/get_event_by_id', methods=['GET'])
# def get_event_by_id_route():
#     return get_event_by_id()

# @calendar_bp.route('/create_event', methods=['POST'])
# def create_event_route():
#     return create_event()

# @calendar_bp.route('/rsvp', methods=['POST'])
# def rsvp_route():
#     return rsvp()

# @calendar_bp.route('/delete_event', methods=['DELETE'])
# def delete_event_route():
#     return delete_event()
