from flask import Blueprint
from controllers.auth import login, register, refresh, google_auth, google_complete

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

@auth_bp.route('/google', methods=['POST'])
def google_auth_route():
    return google_auth()

@auth_bp.route('/google/complete', methods=['POST'])
def google_complete_route():
    return google_complete()
