from flask import Blueprint, request
from controllers.management import update_management

management_bp = Blueprint('management', __name__)

@management_bp.route('/update', methods=['PUT'])
def update():
    return update_management(request) 