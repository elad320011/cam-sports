from flask import Blueprint, request
from controllers.player import update_player, get_player_details

player_bp = Blueprint('player', __name__)

@player_bp.route('/details', methods=['GET'])
def get_details():
    return get_player_details(request)

@player_bp.route('/update', methods=['PUT'])
def update():
    return update_player(request) 