from flask import Blueprint
from controllers.auth import login, register, refresh

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login_route():
    return login()

@auth_bp.route('/register', methods=['POST'])
def register_route():
    return register()

@auth_bp.route('/refresh', methods=['POST'])
def refresh_route():
    return refresh()
