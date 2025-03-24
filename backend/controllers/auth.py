from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta  # Update this import line
import os
from functools import wraps
from models.player import Player
from models.management import Management
from models.team import Team
import random
import string

# Update these to use timedelta directly
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')

def create_tokens(user_id, user_type):
    access_token = jwt.encode({
        'user_id': str(user_id),
        'user_type': user_type,
        'exp': datetime.utcnow() + ACCESS_TOKEN_EXPIRE  # Remove .datetime
    }, JWT_SECRET, algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': str(user_id),
        'user_type': user_type,
        'exp': datetime.utcnow() + REFRESH_TOKEN_EXPIRE  # Remove .datetime
    }, JWT_SECRET, algorithm='HS256')
    
    return access_token, refresh_token

def login():
    data = request.get_json()
    email = data.get('email', '').lower()  # Changed from username to email
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    # Try to find user in each collection
    user = None
    user_type = None
    team_id = None
    full_name = None
    
    # Check Player collection
    user = Player.objects(email=email).first()
    if user and check_password_hash(user.password, password):
        user_type = 'player'
        team_id = user.team_id
        full_name = user.full_name
    
    # Check Management collection
    if not user:
        user = Management.objects(email=email).first()
        if user and check_password_hash(user.password, password):
            user_type = 'management'
            team_id = user.team_id
            full_name = user.full_name
    
    if user and user_type:
        access_token, refresh_token = create_tokens(str(user.id), user_type)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": full_name,
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
    team_code = data.get('team_code')
    email = data.get('email', '').lower()  # Get and normalize email

    if user_type == 'player':
        if not all([email, data.get('full_name'), data.get('password'),
                   data.get('role'), data.get('birth_date'), 
                   data.get('weight'), data.get('height'), data.get('team_code')]):
            return jsonify({"message": "All fields are required"}), 400

        # Check if email exists in either Player or Management collection
        if Player.objects(email=email).first():
            return jsonify({"message": "Email already registered as a player"}), 400
        if Management.objects(email=email).first():
            return jsonify({"message": "Email already registered as management"}), 400

        # Verify team code exists
        team = Team.objects(code=team_code).first()
        if not team:
            return jsonify({"message": "Invalid team code"}), 400

        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

        player = Player(
            email=email,
            full_name=data['full_name'],
            password=generate_password_hash(data['password']),
            role=data['role'],
            birth_date=birth_date,
            weight=float(data['weight']),
            height=float(data['height']),
            team_id=team.team_id
        )
        player.save()

        # Add player's email to the team's players list
        team.update(push__players=email)

    elif user_type == 'management':
        if not all([email, data.get('full_name'), data.get('password'), data.get('team_code')]):
            return jsonify({"message": "Email, full name, password, and team code are required"}), 400

        # Check if email exists in either Player or Management collection
        if Management.objects(email=email).first():
            return jsonify({"message": "Email already registered as management"}), 400
        if Player.objects(email=email).first():
            return jsonify({"message": "Email already registered as a player"}), 400

        # Verify team code exists
        team = Team.objects(code=team_code).first()
        if not team:
            return jsonify({"message": "Invalid team code"}), 400

        management = Management(
            email=email,
            full_name=data['full_name'],
            password=generate_password_hash(data['password']),
            team_id=team.team_id
        )
        management.save()

        # Add management's email to the team's management list
        team.update(push__management=email)

    elif user_type == 'team':
        if not data.get('team_id'):
            return jsonify({"message": "Team ID is required"}), 400

        # Generate a unique team code
        team_code = generate_team_code()
        
        team = Team(
            team_id=data['team_id'],
            code=team_code,
            players=[],
            management=[]
        )
        team.save()

        return jsonify({
            "message": "Team registered successfully",
            "team_code": team_code
        }), 201

    return jsonify({"message": "Registration successful", "redirect": True}), 201

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
