from flask import request, jsonify
from models.team import Team;

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


