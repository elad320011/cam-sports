from flask import Blueprint, request
from controllers.events import create_event, get_event, list_events, update_event, delete_event, rsvp_event, show_attendance, remove_rsvp

calendar_events_bp = Blueprint('event', __name__)

@calendar_events_bp.route('/create', methods=['POST'])
def create_event_route():
    return create_event()

@calendar_events_bp.route('/get', methods=['GET'])
def get_event_route():
    return get_event()

@calendar_events_bp.route('/list', methods=['GET'])
def list_events_route():
    return list_events()

@calendar_events_bp.route('/update', methods=['PUT'])
def update_event_route():
    return update_event()

@calendar_events_bp.route('/delete', methods=['DELETE'])
def delete_event_route():
    return delete_event()

@calendar_events_bp.route('/rsvp', methods=['POST'])
def rsvp_event_route():
    return rsvp_event()

@calendar_events_bp.route('/attendance', methods=['GET'])
def show_attendance_route():
    return show_attendance()

@calendar_events_bp.route('/remove_rsvp', methods=['DELETE'])
def remove_rsvp_route():
    return remove_rsvp()