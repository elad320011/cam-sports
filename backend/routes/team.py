from flask import Blueprint, request
from controllers.team import get_team_by_code, create_team, update_team

team_bp = Blueprint('team', __name__)

@team_bp.route('/get_by_code', methods=['GET'])
def get():
    return get_team_by_code(request)

@team_bp.route('/create', methods=['POST'])
def create():
    return create_team(request)

@team_bp.route('/update', methods=['PUT'])
def update():
    return update_team(request)
