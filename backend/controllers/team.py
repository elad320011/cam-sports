from flask import request, jsonify
from models.team import Team;

def get_team_by_code(request):
    team_code = request.args.get('team_code')
    if not team_code:
        return jsonify({"error": "team_code is required"}), 400

    team = Team.objects(code=team_code).first()
    if not team:
        return jsonify({"error": "Team not found"}), 404

    team_dict = team.to_mongo().to_dict()
    team_dict['_id'] = str(team_dict['_id'])  

    return jsonify(team_dict), 200


def create_team(request):
    data = request.get_json()
    team_name = data.get('name')
    manager = data.get('manager')
    staff = data.get('staff')
    players = data.get('players')


    team_object = Team(
        name=team_name,
        manager=manager,
        staff=staff,
        players=players
    )
    team_object.save()
    
    return jsonify({"message": "Created team successfully"})


def update_team(request):
    data = request.get_json()

    team_id = data.get('team_id')
    if not team_id:
        return jsonify({"error": "team_id is required"}), 400

    team = Team.objects(team_id=team_id).first()
    if not team:
        return jsonify({"error": "Team not found"}), 404

    if 'code' in data:
        team.code = data['code']
    if 'players' in data:
        team.players = data['players']
    if 'management' in data:
        team.management = data['management']
    if 'calendar_id' in data:
        team.calendar_id = data['calendar_id']

    team.save()
    return jsonify({"message": "Updated team successfully"}), 200

