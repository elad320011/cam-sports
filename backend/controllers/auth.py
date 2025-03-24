from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from models.player import Player
from models.management import Management
from models.team import Team
import random
import string

# Add these at the top of the file
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')  # Use environment variable in production

def create_tokens(user_id, user_type):
    access_token = jwt.encode({
        'user_id': str(user_id),
        'user_type': user_type,
        'exp': datetime.utcnow() + ACCESS_TOKEN_EXPIRE
    }, JWT_SECRET, algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': str(user_id),
        'user_type': user_type,
        'exp': datetime.utcnow() + REFRESH_TOKEN_EXPIRE
    }, JWT_SECRET, algorithm='HS256')
    
    return access_token, refresh_token

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    # Try to find user in each collection
    user = None
    user_type = None
    team_id = None
    
    # Check Player collection
    user = Player.objects(username=username).first()
    if user and check_password_hash(user.password, password):
        user_type = 'player'
        team_id = user.team_id
    
    # Check Management collection
    if not user:
        user = Management.objects(username=username).first()
        if user and check_password_hash(user.password, password):
            user_type = 'management'
            team_id = user.team_id
    
    # Check Team collection
    if not user:
        team = Team.objects(team_id=username).first()  # Note: Using team_id as login credential
        if team:
            user_type = 'team'
            team_id = team.team_id
            user = team  # For consistency in the response
    
    if user and user_type:
        access_token, refresh_token = create_tokens(str(user.id), user_type)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "username": username,
                "user_type": user_type,
                "team_id": team_id
            }
        })
    else:
        return jsonify({"message": "Invalid credentials"}), 401

def generate_team_code(length=6):
    """Generate a unique team code"""
    while True:
        # Generate a random code (uppercase letters and numbers)
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        
        # Check if this code already exists
        if not Team.objects(code=code).first():  # Changed from team_id to code
            return code

def register():
    data = request.get_json()
    user_type = data.get('user_type')

    try:
        if user_type == 'team':
            team_id = data.get('team_id')
            
            if not team_id:
                return jsonify({"message": "Team ID is required"}), 400
            
            if Team.objects(team_id=team_id).first():
                return jsonify({"message": "Team ID already exists"}), 400
            
            # Generate a unique random code
            random_code = generate_team_code()
            
            team = Team(
                team_id=team_id,
                code=random_code
            )
            team.save()
            
            return jsonify({
                "message": "Team registration successful", 
                "team_code": random_code,  # Return the random code instead of team_id
                "redirect": "/login"
            }), 201
            
        else:  # player or management
            username = data.get('username')
            password = data.get('password')
            team_code = data.get('team_code')

            if not username or not password:
                return jsonify({"message": "Username and password are required"}), 400
            
            if len(username) < 3:
                return jsonify({"message": "Username must be at least 3 characters long"}), 400
            if len(password) < 6:
                return jsonify({"message": "Password must be at least 6 characters long"}), 400
            
            if not team_code:
                return jsonify({"message": "Team code is required"}), 400
                
            # Look up team by code instead of team_id
            team = Team.objects(code=team_code).first()
            if not team:
                return jsonify({"message": "Invalid team code"}), 400
            
            if (Player.objects(username=username).first() or 
                Management.objects(username=username).first()):
                return jsonify({"message": "Username already exists"}), 400

            hashed_password = generate_password_hash(password)
            
            if user_type == 'player':
                user = Player(username=username, password=hashed_password, team_id=team.team_id)
                user.save()
                
                if username not in team.players:
                    team.players.append(username)
                    team.save()
                    
            else:  # management
                user = Management(username=username, password=hashed_password, team_id=team.team_id)
                user.save()
                
                if username not in team.management:
                    team.management.append(username)
                    team.save()
            
            return jsonify({
                "message": "Registration successful", 
                "redirect": "/login"
            }), 201

    except Exception as e:
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

def refresh():
    refresh_token = request.headers.get('Authorization')
    if not refresh_token:
        return jsonify({"message": "Refresh token required"}), 401
    
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload['user_id']
        new_access_token, new_refresh_token = create_tokens(user_id, payload['user_type'])
        
        return jsonify({
            "access_token": new_access_token,
            "refresh_token": new_refresh_token
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Refresh token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid refresh token"}), 401

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"message": "No token provided"}), 401
            
        try:
            # Remove 'Bearer ' prefix if present
            token = auth_header.replace('Bearer ', '')
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = payload['user_id']  # Attach user_id to request
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
            
    return decorated
