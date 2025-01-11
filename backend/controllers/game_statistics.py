from flask import request, jsonify
from models.game_statistics import GameStatistics, SetScore, PlayerStats, AttackStats, ServeStats, ServeReceivesStats, DigsStats, SettingStats, BlocksStats
import datetime


def create_game_statistics(request):

    # extract required data
    data = request.get_json()
    team_id = data.get('team_id')
    opposite_team_name = data.get('opposite_team_name')
    game_date = datetime.datetime.fromisoformat(data.get('game_date').replace('Z', '+00:00'))

    # optionals
    team_sets_won_count = data.get('team_sets_won_count', 0)
    team_sets_lost_count = data.get('team_sets_lost_count', 0)
    sets_scores = {str(k): SetScore(**v) for k, v in data.get('sets_scores', {}).items()}
    team_stats = {
        player_id: PlayerStats(
            position=stats.get('position', ''),
            starter=stats.get('starter', True),
            attack=AttackStats(**stats.get('attack', {})),
            serve=ServeStats(**stats.get('serve', {})),
            serve_recieves=ServeReceivesStats(**stats.get('serve_recieves', {})),
            digs=DigsStats(**stats.get('digs', {})),
            setting=SettingStats(**stats.get('setting', {})),
            blocks=BlocksStats(**stats.get('blocks', {}))
        ) for player_id, stats in data.get('team_stats', {}).items()
    }

    # create the statistics document
    game_statistics = GameStatistics(
        team_id=team_id,
        opposite_team_name=opposite_team_name,
        game_date=game_date,
        team_sets_won_count=team_sets_won_count,
        team_sets_lost_count=team_sets_lost_count,
        sets_scores=sets_scores,
        team_stats=team_stats
    )
    game_statistics.save()
    print(game_statistics)

    return jsonify({"message": "Game statistics created successfully"})