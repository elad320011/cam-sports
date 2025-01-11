from flask import Blueprint, request
from controllers.game_statistics import create_game_statistics

game_statistics_bp = Blueprint('game_statistics', __name__)

@game_statistics_bp.route('/create', methods=['POST'])
def create():
    return create_game_statistics(request)
