from flask import request, jsonify
from models.formation import Formation
from models.player import Player
import mongoengine as me

def create_formation():
    try:
        data = request.get_json()
        name = data.get('name')
        team_id = data.get('team_id')

        if not name or not team_id:
            return jsonify({"message": "Formation name and team_id are required"}), 400

        if Formation.objects(name=name, team_id=team_id).first():
            return jsonify({"message": "Formation with this name already exists for the team"}), 400

        # Create formation with default empty roles
        formation = Formation(
            name=name,
            team_id=team_id
        )
        formation.save()

        # Prepare the response data
        result = {
            "id": str(formation.id),
            "name": formation.name,
            "team_id": formation.team_id,
            "roles": {
                "role_1": formation.role_1,
                "role_2": formation.role_2,
                "role_3": formation.role_3,
                "role_4": formation.role_4,
                "role_5": formation.role_5,
                "role_6": formation.role_6
            }
        }

        return jsonify(result), 201

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def list_formations():
    try:
        team_id = request.args.get('team_id')

        if not team_id:
            return jsonify({"message": "team_id is required"}), 400

        formations = Formation.objects(team_id=team_id)
        result = []

        for formation in formations:
            result.append({
                "id": str(formation.id),
                "name": formation.name,
                "team_id": formation.team_id,
                "roles": {
                    "role_1": formation.role_1,
                    "role_2": formation.role_2,
                    "role_3": formation.role_3,
                    "role_4": formation.role_4,
                    "role_5": formation.role_5,
                    "role_6": formation.role_6
                }
            })

        return jsonify({"formations": result}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def get_formation(formation_id):
    try:
        formation = Formation.objects(id=formation_id).first()

        if not formation:
            return jsonify({"message": "Formation not found"}), 404

        # Get player names for each role
        roles = {}
        for i in range(1, 7):
            role_key = f"role_{i}"
            role_data = getattr(formation, role_key)
            player_id = role_data.get('player_id')
            
            if player_id:
                player = Player.objects(id=player_id).first()
                player_name = player.full_name if player else "Unassigned"
            else:
                player_name = "Unassigned"

            roles[role_key] = {
                "player_id": player_id,
                "name": player_name,
                "instructions": role_data.get('instructions', '')
            }

        result = {
            "id": str(formation.id),
            "name": formation.name,
            "team_id": formation.team_id,
            "roles": roles
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def edit_formation(formation_id):
    try:
        data = request.get_json()
        formation = Formation.objects(id=formation_id).first()

        if not formation:
            return jsonify({"message": "Formation not found"}), 404

        # Update formation name if provided
        name = data.get('name')
        if name:
            formation.name = name

        # Update roles if provided
        roles_data = data.get('roles', {})
        if not isinstance(roles_data, dict):
            return jsonify({"message": "Invalid roles format. Expected a dictionary."}), 400

        for role_key, role_data in roles_data.items():
            if role_key in ['role_1', 'role_2', 'role_3', 'role_4', 'role_5', 'role_6']:
                if isinstance(role_data, dict):
                    player_id = role_data.get('player_id')
                    instructions = role_data.get('instructions')

                    # Validate player_id if provided
                    if player_id and player_id != "None":
                        if not Player.objects(id=player_id).first():
                            return jsonify({"message": f"Player with id {player_id} not found."}), 400

                    # Update role data
                    setattr(formation, role_key, {
                        'player_id': player_id if player_id and player_id != "None" else None,
                        'instructions': instructions if instructions is not None else ''
                    })

        formation.save()
        return jsonify({"message": "Formation updated successfully"}), 200

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def delete_formation(formation_id):
    try:
        formation = Formation.objects(id=formation_id).first()

        if not formation:
            return jsonify({"message": "Formation not found"}), 404

        formation.delete()
        return jsonify({"message": "Formation deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
