from flask import Blueprint, request
from controllers.game_statistics import create_game_statistics, get_game_statistics_by_id, get_game_statistics_by_team_id, delete_game_statistics_by_id, update_game_statistics

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

@game_statistics_bp.route('/game_id/<game_id>', methods=['DELETE'])
def delete_game_statistics_route(game_id):
    return delete_game_statistics_by_id(game_id)

@game_statistics_bp.route('/update', methods=['PUT'])
def update_game_statistics_route():
    return update_game_statistics(request)
