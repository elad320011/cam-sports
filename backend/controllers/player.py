from flask import request, jsonify
from models.player import Player
from models.team import Team
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

def get_player_details(request):
    email = request.args.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    player = Player.objects(email=email).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404
    
    # Convert to dict for JSON response
    player_data = {
        "email": player.email,
        "full_name": player.full_name,
        "role": player.role,
        "birth_date": player.birth_date.strftime('%Y-%m-%d') if player.birth_date else None,
        "weight": player.weight,
        "height": player.height
    }
    
    return jsonify(player_data), 200

def update_player(request):
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    player = Player.objects(email=email).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404
    
    # Update fields if they are provided
    if 'full_name' in data:
        player.full_name = data['full_name']
    
    if 'role' in data:
        player.role = data['role']
    
    if 'weight' in data:
        player.weight = float(data['weight'])
    
    if 'height' in data:
        player.height = float(data['height'])
    
    if 'team_id' in data:
        # Convert the string to ObjectId
        try:
            team_id = ObjectId(data['team_id'])
            # Verify team exists
            team = Team.objects(id=team_id).first()
            if not team:
                return jsonify({"error": "Team not found"}), 404
            player.team_id = team_id
        except Exception as e:
            return jsonify({"error": f"Invalid team id format: {str(e)}"}), 400
    
    try:
        player.save()
        return jsonify({"message": "Player updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update player: {str(e)}"}), 500

def change_player_password(request):
    data = request.get_json()
    email = data.get('email')
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not all([email, current_password, new_password]):
        return jsonify({"error": "Email, current password, and new password are required"}), 400
    
    player = Player.objects(email=email).first()
    if not player:
        return jsonify({"error": "Player not found"}), 404
    
    # Verify current password
    if not check_password_hash(player.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Update password
    player.password = generate_password_hash(new_password)
    
    try:
        player.save()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update password: {str(e)}"}), 500 