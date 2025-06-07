from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta  # Update this import line
import os
from functools import wraps
from models.player import Player
from models.management import Management
from models.team import Team
from models.message_board import MessageBoard
import random
import string
import requests

# Update these to use timedelta directly
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')

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
    print(f"🔍 Login attempt received for email: {request.get_json().get('email', 'MISSING')}")
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    # Add password length validation
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400

    # Try to find user in each collection
    user = None
    user_type = None
    team_id = None
    full_name = None

    # Check Player collection first
    user = Player.objects(email=email).first()
    if user:
        if check_password_hash(user.password, password):
            user_type = 'player'
            team_id = user.team_id
            full_name = user.full_name
        else:
            # User exists but wrong password
            return jsonify({"message": "Incorrect password"}), 401

    # Check Management collection if not found in Player
    if not user:
        user = Management.objects(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                user_type = 'management'
                team_id = user.team_id
                full_name = user.full_name
            else:
                # User exists but wrong password
                return jsonify({"message": "Incorrect password"}), 401

    # If user not found in either collection
    if not user:
        return jsonify({"message": "No account found with this email address"}), 404

    # Get calendar id for team
    team = Team.objects(id=team_id).first()
    calendar_id = team.calendar_id if team else None

    if user and user_type:
        access_token, refresh_token = create_tokens(str(user.id), user_type)

        # Get team name for the response
        team_name = None
        if user.team_id:
            team = Team.objects(id=user.team_id).first()
            if team:
                team_name = team.name

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": full_name,
                "user_type": user_type,
                "calendar_id": calendar_id,
                "team_id": team_name  # Send team name instead of ID
            }
        })
    else:
        return jsonify({"message": "Authentication failed"}), 401

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
    email = data.get('email', '').lower()

    if user_type == 'player':
        if not all([email, data.get('full_name'), data.get('password'),
                   data.get('role'), data.get('birth_date'),
                   data.get('weight'), data.get('height'), data.get('team_code')]):
            return jsonify({"message": "All fields are required"}), 400

        # Validate password length
        password = data.get('password')
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

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

        try:
            player = Player(
                email=email,
                full_name=data['full_name'],
                password=generate_password_hash(data['password']),
                role=data['role'],
                birth_date=birth_date,
                weight=float(data['weight']),
                height=float(data['height']),
                team_id=team.id  # Use the MongoDB ObjectId
            )
            player.save()

            # Add player's email to the team's players list
            team.update(push__players=email)
        except Exception as e:
            return jsonify({"message": f"Error creating player account: {str(e)}"}), 500

    elif user_type == 'management':
        if not all([email, data.get('full_name'), data.get('password'), data.get('team_code')]):
            return jsonify({"message": "Email, full name, password, and team code are required"}), 400

        # Validate password length
        password = data.get('password')
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        # Check if email exists in either Player or Management collection
        if Management.objects(email=email).first():
            return jsonify({"message": "Email already registered as management"}), 400
        if Player.objects(email=email).first():
            return jsonify({"message": "Email already registered as a player"}), 400

        # Verify team code exists
        team = Team.objects(code=team_code).first()
        if not team:
            return jsonify({"message": "Invalid team code"}), 400

        try:
            management = Management(
                email=email,
                full_name=data['full_name'],
                password=generate_password_hash(data['password']),
                team_id=team.id  # Use the MongoDB ObjectId
            )
            management.save()

            # Add management's email to the team's management list
            team.update(push__management=email)
        except Exception as e:
            return jsonify({"message": f"Error creating management account: {str(e)}"}), 500

    elif user_type == 'team':
        if not data.get('team_id'):  # We'll still use team_id in the request but save it as name
            return jsonify({"message": "Team name is required"}), 400

        # Check if team name already exists
        existing_team = Team.objects(name=data['team_id']).first()
        if existing_team:
            return jsonify({"message": "Team name already exists"}), 400

        # Generate a unique team code
        team_code = generate_team_code()

        try:
            team = Team(
                name=data['team_id'],  # Save as team name
                code=team_code,
                players=[],
                management=[]
            )
            team.save()

            return jsonify({
                "message": "Team registered successfully",
                "team_code": team_code
            }), 201
        except Exception as e:
            return jsonify({"message": "Error creating team: " + str(e)}), 500

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

def verify_google_token(token):
    """Verify the Google token with Google's API"""
    try:
        # Call Google's API to verify the token
        response = requests.get(
            f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={token}'
        )
        
        if response.status_code != 200:
            return None
            
        data = response.json()
        return data
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None

def get_google_user_info(token):
    """Get user information from Google API"""
    try:
        response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code != 200:
            return None
            
        return response.json()
    except Exception as e:
        print(f"Error getting Google user info: {e}")
        return None

def google_auth():
    """Handle Google authentication"""
    data = request.get_json()
    google_token = data.get('access_token')
    
    if not google_token:
        return jsonify({"message": "Google access token is required"}), 400
    
    # Verify the token with Google
    token_info = verify_google_token(google_token)
    if not token_info:
        return jsonify({"message": "Invalid Google token"}), 401
    
    # Get user information from Google
    user_info = get_google_user_info(google_token)
    if not user_info:
        return jsonify({"message": "Failed to get user information from Google"}), 500
    
    email = user_info.get('email', '').lower()
    
    # Check if the user exists in our database
    player = Player.objects(email=email).first()
    if player:
        # User exists as a player, create JWT tokens and log them in
        team = Team.objects(id=player.team_id).first()
        access_token, refresh_token = create_tokens(str(player.id), 'player')
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": player.full_name,
                "user_type": 'player',
                "calendar_id": team.calendar_id if team else '',
                "team_id": team.name if team else ''
            }
        })
    
    management = Management.objects(email=email).first()
    if management:
        # User exists as management, create JWT tokens and log them in
        team = Team.objects(id=management.team_id).first()
        access_token, refresh_token = create_tokens(str(management.id), 'management')
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": management.full_name,
                "user_type": 'management',
                "calendar_id": team.calendar_id if team else '',
                "team_id": team.name if team else ''
            }
        })
    
    # User doesn't exist yet, return their information for registration
    return jsonify({
        "message": "User not registered",
        "needs_registration": True,
        "email": email,
        "name": user_info.get('name', ''),
        "google_id": user_info.get('id', '')
    }), 200

def google_complete():
    """Complete Google user registration"""
    data = request.get_json()
    email = data.get('email', '').lower()
    full_name = data.get('full_name')
    google_id = data.get('google_id')
    user_type = data.get('user_type')
    
    if not all([email, full_name, google_id, user_type]):
        return jsonify({"message": "Email, name, Google ID, and user type are required"}), 400
    
    # Create a random secure password for Google users
    # They'll never use this directly as they authenticate via Google
    random_password = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
    hashed_password = generate_password_hash(random_password)
    
    if user_type == 'player':
        team_code = data.get('team_code')
        role = data.get('role')
        birth_date_str = data.get('birth_date')
        weight = data.get('weight')
        height = data.get('height')
        
        if not all([team_code, role, birth_date_str, weight, height]):
            return jsonify({"message": "All player fields are required"}), 400
        
        # Verify team code exists
        team = Team.objects(code=team_code).first()
        if not team:
            return jsonify({"message": "Invalid team code"}), 400
        
        try:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # Create the player
        player = Player(
            email=email,
            full_name=full_name,
            password=hashed_password,  # Use the hashed random password
            role=role,
            birth_date=birth_date,
            weight=float(weight),
            height=float(height),
            team_id=team.id
        )
        player.save()
        
        # Add player to team
        team.update(push__players=email)
        
        # Create tokens and login the user
        access_token, refresh_token = create_tokens(str(player.id), 'player')
        
        return jsonify({
            "message": "Registration successful",
            "redirect": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": full_name,
                "user_type": 'player',
                "calendar_id": team.calendar_id,
                "team_id": team.name
            }
        }), 201
        
    elif user_type == 'management':
        team_code = data.get('team_code')
        
        if not team_code:
            return jsonify({"message": "Team code is required"}), 400
        
        # Verify team code exists
        team = Team.objects(code=team_code).first()
        if not team:
            return jsonify({"message": "Invalid team code"}), 400
        
        # Create the management user
        management = Management(
            email=email,
            full_name=full_name,
            password=hashed_password,  # Use the hashed random password
            team_id=team.id
        )
        management.save()
        
        # Add management to team
        team.update(push__management=email)
        
        # Create tokens and login the user
        access_token, refresh_token = create_tokens(str(management.id), 'management')
        
        return jsonify({
            "message": "Registration successful",
            "redirect": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": email,
                "full_name": full_name,
                "user_type": 'management',
                "calendar_id": team.calendar_id,
                "team_id": team.name
            }
        }), 201
        
    elif user_type == 'team':
        team_id = data.get('team_id')
        
        if not team_id:
            return jsonify({"message": "Team name is required"}), 400
        
        # Check if team name already exists
        existing_team = Team.objects(name=team_id).first()
        if existing_team:
            return jsonify({"message": "Team name already exists"}), 400
        
        # Generate a unique team code
        team_code = generate_team_code()
        
        try:
            team = Team(
                name=team_id,
                code=team_code,
                players=[],
                management=[]
            )
            team.save()
            
            return jsonify({
                "message": "Team registered successfully",
                "team_code": team_code
            }), 201
        except Exception as e:
            return jsonify({"message": "Error creating team: " + str(e)}), 500
    
    return jsonify({"message": "Invalid user type"}), 400
