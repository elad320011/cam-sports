from flask import Blueprint, request
from controllers.payment import create_payment

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create', methods=['POST'])
def create():
    return create_payment(request)
