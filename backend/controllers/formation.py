from flask import request, jsonify
from models.formation import Formation
from models.role import Role
import mongoengine as me

def create_formation():
    try:
        # Extract data from the request
        data = request.get_json()
        name = data.get('name')
        team_id = data.get('team_id')

        if not name or not team_id:
            return jsonify({"message": "Formation name and team_id are required"}), 400

        # Check if a formation with the same name already exists for the team
        if Formation.objects(name=name, team_id=team_id).first():
            return jsonify({"message": "Formation with this name already exists for the team"}), 400

        # Create empty roles
        roles = []
        for _ in range(6):
            role = Role(player_id=None, instructions="").save()
            roles.append(role)

        # Create the formation
        formation = Formation(
            name=name,
            team_id=team_id,
            role_1=roles[0],
            role_2=roles[1],
            role_3=roles[2],
            role_4=roles[3],
            role_5=roles[4],
            role_6=roles[5]
        )
        formation.save()

        return jsonify({"message": "Formation created successfully", "formation_id": str(formation.id)}), 201

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
