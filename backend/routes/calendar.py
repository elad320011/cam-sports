from flask import Blueprint, request
from controllers.calendar import get_team_calendar, list_team_calendars, create_team_calendar, delete_team_calendar, share_calendar

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

@calendar_bp.route('/share_calendar', methods=['POST'])
def share_calendar_route():
    return share_calendar()