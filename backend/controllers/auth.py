from flask import request, jsonify
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Add validation for empty fields
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    user = User.objects(username=username).first()
    if user and check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "redirect": "/"
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401

def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')

    # Add validation for empty fields
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
        
    # Add minimum length requirements
    if len(username) < 3:
        return jsonify({"message": "Username must be at least 3 characters long"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400

    if User.objects(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password, user_type=user_type, team_id='')
    user.save()
    
    return jsonify({
        "message": "Registration successful", 
        "redirect": "/login"
    }), 201
