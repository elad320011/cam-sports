from flask import request, jsonify
from models.formation import Formation
from models.role import Role
import mongoengine as me

def create_formation():
    try:
        # Log the incoming request data for debugging
        data = request.get_json()
        print("Incoming request data:", data)

        # Extract and validate data
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
        print("Validation error:", e)
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def list_formations():
    try:
        # Extract team_id from the request arguments
        team_id = request.args.get('team_id')

        if not team_id:
            return jsonify({"message": "team_id is required"}), 400

        # Retrieve all formations for the given team_id
        formations = Formation.objects(team_id=team_id)
        result = []

        for formation in formations:
            result.append({
                "id": str(formation.id),
                "name": formation.name,
                "team_id": formation.team_id,
                "roles": {
                    "role_1": str(formation.role_1.player_id) if formation.role_1 else None,
                    "role_2": str(formation.role_2.player_id) if formation.role_2 else None,
                    "role_3": str(formation.role_3.player_id) if formation.role_3 else None,
                    "role_4": str(formation.role_4.player_id) if formation.role_4 else None,
                    "role_5": str(formation.role_5.player_id) if formation.role_5 else None,
                    "role_6": str(formation.role_6.player_id) if formation.role_6 else None,
                }
            })

        return jsonify({"formations": result}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
