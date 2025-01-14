from flask import Blueprint, request
from controllers.payment import update_payment_method, get_payment_method

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create', methods=['POST'])
def create():
    return update_payment_method(request)

@payment_bp.route('/get', methods=['GET'])
def get():
    return get_payment_method(request)
