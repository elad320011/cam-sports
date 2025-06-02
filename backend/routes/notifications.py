from flask import Blueprint, request
from controllers.notifications import send_notifications, register_notifications

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/send', methods=['POST'])
def send_notification():
    return send_notifications(request)

@notifications_bp.route('/register', methods=['POST'])
def register_notification():
    return register_notifications(request)