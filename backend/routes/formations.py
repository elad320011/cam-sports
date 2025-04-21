from flask import Blueprint
from controllers.formation import create_formation, list_formations, get_formation, edit_formation

formations_bp = Blueprint('formations', __name__)

@formations_bp.route('/create', methods=['POST'])
def create_formation_route():
    return create_formation()

@formations_bp.route('/list', methods=['GET'])
def list_formations_route():
    return list_formations()

@formations_bp.route('/<formation_id>', methods=['GET'])
def get_formation_route(formation_id):
    return get_formation(formation_id)

@formations_bp.route('/<formation_id>/edit', methods=['PUT'])
def edit_formation_route(formation_id):
    return edit_formation(formation_id)
