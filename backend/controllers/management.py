from flask import request, jsonify
from models.management import Management
from models.team import Team
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash

def get_management_details(request):
    email = request.args.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    management = Management.objects(email=email).first()
    if not management:
        return jsonify({"error": "Management user not found"}), 404
    
    # Convert to dict for JSON response
    management_data = {
        "email": management.email,
        "full_name": management.full_name,
    }
    
    return jsonify(management_data), 200

def update_management(request):
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    management = Management.objects(email=email).first()
    if not management:
        return jsonify({"error": "Management user not found"}), 404
    
    # Update fields if they are provided
    if 'full_name' in data:
        management.full_name = data['full_name']
    
    if 'team_id' in data:
        # Convert the string to ObjectId
        try:
            team_id = ObjectId(data['team_id'])
            # Verify team exists
            team = Team.objects(id=team_id).first()
            if not team:
                return jsonify({"error": "Team not found"}), 404
            management.team_id = team_id
        except Exception as e:
            return jsonify({"error": f"Invalid team id format: {str(e)}"}), 400
    
    try:
        management.save()
        return jsonify({"message": "Management user updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update management user: {str(e)}"}), 500

def change_management_password(request):
    data = request.get_json()
    email = data.get('email')
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not all([email, current_password, new_password]):
        return jsonify({"error": "Email, current password, and new password are required"}), 400

    # Validate password length
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    management = Management.objects(email=email).first()
    if not management:
        return jsonify({"error": "Management user not found"}), 404
    
    # Verify current password
    if not check_password_hash(management.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Check if new password is the same as current password
    if check_password_hash(management.password, new_password):
        return jsonify({"error": "New password must be different from current password"}), 400
    
    # Update password
    management.password = generate_password_hash(new_password)
    
    try:
        management.save()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update password: {str(e)}"}), 500 