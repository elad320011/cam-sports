from flask import Blueprint
from controllers.formation import create_formation, list_formations

formations_bp = Blueprint('formations', __name__)

@formations_bp.route('/create', methods=['POST'])
def create_formation_route():
    return create_formation()

@formations_bp.route('/list', methods=['GET'])
def list_formations_route():
    return list_formations()
