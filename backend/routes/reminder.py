from flask import Blueprint
from controllers.reminder import list_scheduled_reminders

reminder_bp = Blueprint('reminder', __name__)

@reminder_bp.route('/scheduled', methods=['GET'])
def scheduled():
    return list_scheduled_reminders() 
