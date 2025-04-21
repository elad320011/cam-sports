from flask import request, jsonify
from models.formation import Formation
from models.role import Role
from models.player import Player
import mongoengine as me

def create_formation():
    try:
        # Extract and validate data
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

        # Prepare the response data
        result = {
            "id": str(formation.id),
            "name": formation.name,
            "team_id": formation.team_id,
            "roles": {
                "role_1": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
                "role_2": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
                "role_3": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
                "role_4": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
                "role_5": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
                "role_6": {
                    "player_id": None,
                    "name": "Unassigned",
                    "instructions": "",
                },
            }
        }

        return jsonify(result), 201

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
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

def get_formation(formation_id):
    try:
        # Retrieve the formation by ID
        formation = Formation.objects(id=formation_id).first()

        if not formation:
            return jsonify({"message": "Formation not found"}), 404

        # Prepare the response data
        result = {
            "id": str(formation.id),
            "name": formation.name,
            "team_id": formation.team_id,
            "roles": {
                "role_1": {
                    "player_id": str(formation.role_1.player_id.id) if formation.role_1 and formation.role_1.player_id else None,
                    "name": formation.role_1.player_id.full_name if formation.role_1 and formation.role_1.player_id else "Unassigned",
                    "instructions": formation.role_1.instructions if formation.role_1 else "",
                },
                "role_2": {
                    "player_id": str(formation.role_2.player_id.id) if formation.role_2 and formation.role_2.player_id else None,
                    "name": formation.role_2.player_id.full_name if formation.role_2 and formation.role_2.player_id else "Unassigned",
                    "instructions": formation.role_2.instructions if formation.role_2 else "",
                },
                "role_3": {
                    "player_id": str(formation.role_3.player_id.id) if formation.role_3 and formation.role_3.player_id else None,
                    "name": formation.role_3.player_id.full_name if formation.role_3 and formation.role_3.player_id else "Unassigned",
                    "instructions": formation.role_3.instructions if formation.role_3 else "",
                },
                "role_4": {
                    "player_id": str(formation.role_4.player_id.id) if formation.role_4 and formation.role_4.player_id else None,
                    "name": formation.role_4.player_id.full_name if formation.role_4 and formation.role_4.player_id else "Unassigned",
                    "instructions": formation.role_4.instructions if formation.role_4 else "",
                },
                "role_5": {
                    "player_id": str(formation.role_5.player_id.id) if formation.role_5 and formation.role_5.player_id else None,
                    "name": formation.role_5.player_id.full_name if formation.role_5 and formation.role_5.player_id else "Unassigned",
                    "instructions": formation.role_5.instructions if formation.role_5 else "",
                },
                "role_6": {
                    "player_id": str(formation.role_6.player_id.id) if formation.role_6 and formation.role_6.player_id else None,
                    "name": formation.role_6.player_id.full_name if formation.role_6 and formation.role_6.player_id else "Unassigned",
                    "instructions": formation.role_6.instructions if formation.role_6 else "",
                },
            }
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def edit_formation(formation_id):
    try:
        # Retrieve the formation by ID
        data = request.get_json()

        formation = Formation.objects(id=formation_id).first()

        if not formation:
            return jsonify({"message": "Formation not found"}), 404

        # Update formation fields
        name = data.get('name')
        if name:
            formation.name = name

        roles_data = data.get('roles', {})
        if not isinstance(roles_data, dict):
            return jsonify({"message": "Invalid roles format. Expected a dictionary."}), 400

        for role_key, role_data in roles_data.items():
            role = getattr(formation, role_key, None)
            if role and isinstance(role_data, dict):  # Ensure role_data is a dictionary
                player_id = role_data.get('player_id')
                instructions = role_data.get('instructions')

                # Validate and update player_id
                if player_id is None or player_id == "None":
                    role.player_id = None
                else:
                    try:
                        player_object = Player.objects(id=player_id).first()
                        if not player_object:
                            raise ValueError(f"Player with id {player_id} not found.")
                        role.player_id = player_object
                    except Exception as e:
                        return jsonify({"message": f"Invalid player_id for {role_key}: {player_id}", "error": str(e)}), 400

                # Update instructions
                if instructions is not None:
                    role.instructions = instructions

                role.save()

        formation.save()

        return jsonify({"message": "Formation updated successfully"}), 200

    except me.ValidationError as e:
        return jsonify({"message": "Validation error", "error": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
