from flask import request, jsonify
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os
from functools import wraps

# Add these at the top of the file
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=7)
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')  # Use environment variable in production

def create_tokens(user_id):
    access_token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.utcnow() + ACCESS_TOKEN_EXPIRE
    }, JWT_SECRET, algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.utcnow() + REFRESH_TOKEN_EXPIRE
    }, JWT_SECRET, algorithm='HS256')
    
    return access_token, refresh_token

def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Add validation for empty fields
    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400
    
    user = User.objects(username=username).first()
    if user and check_password_hash(user.password, password):
        access_token, refresh_token = create_tokens(user.id)
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "username": user.username,
                "user_type": user.user_type
            }
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

def refresh():
    refresh_token = request.headers.get('Authorization')
    if not refresh_token:
        return jsonify({"message": "Refresh token required"}), 401
    
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload['user_id']
        new_access_token, new_refresh_token = create_tokens(user_id)
        
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
