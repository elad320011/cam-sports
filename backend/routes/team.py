from flask import Blueprint, request
from controllers.team import create_team

team_bp = Blueprint('team', __name__)

@team_bp.route('/create', methods=['POST'])
def create():
    return create_team(request)

