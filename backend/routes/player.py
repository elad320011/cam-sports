from flask import Blueprint, request
from controllers.player import update_player

player_bp = Blueprint('player', __name__)

@player_bp.route('/update', methods=['PUT'])
def update():
    return update_player(request) 