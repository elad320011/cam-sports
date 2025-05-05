from flask import Blueprint, request
from controllers.footage import create_footage_method, get_footage_by_team, delete_footage_method

footage_bp = Blueprint('footage', __name__)

@footage_bp.route('/create', methods=['POST'])
def create():
    return create_footage_method(request)

@footage_bp.route('/get_footage_by_team', methods=['GET'])
def get():
    return get_footage_by_team(request)

@footage_bp.route('/delete', methods=['DELETE'])
def delete():
    return delete_footage_method(request)
