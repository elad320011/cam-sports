from flask import Blueprint, request
from controllers.game_statistics import create_game_statistics, get_game_statistics_by_id, get_game_statistics_by_team_id

game_statistics_bp = Blueprint('game_statistics', __name__)

@game_statistics_bp.route('/create', methods=['POST'])
def create():
    return create_game_statistics(request)


@game_statistics_bp.route('/game_id/<game_id>', methods=['GET'])
def get_game_statistics_by_id_route(game_id):
    return get_game_statistics_by_id(game_id)


@game_statistics_bp.route('/team_id/<team_id>', methods=['GET'])
def get_game_statistics_by_team_id_route(team_id):
    return get_game_statistics_by_team_id(team_id)
