from flask import request, jsonify
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.objects(username=username).first()
    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')
    team_name = data.get('team_name')

    if user_type == 'team_owner' and not team_name:
        return jsonify({"message": "Team name is required for team owners"}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password, user_type=user_type, team_name=team_name)
    user.save()
    
    return jsonify({"message": "Registration successful"})
