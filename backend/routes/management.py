from flask import Blueprint, request
from controllers.management import update_management, get_management_details, change_management_password

management_bp = Blueprint('management', __name__)

@management_bp.route('/details', methods=['GET'])
def get_details():
    return get_management_details(request)

@management_bp.route('/update', methods=['PUT'])
def update():
    return update_management(request)

@management_bp.route('/change-password', methods=['PUT'])
def change_password():
    return change_management_password(request) 