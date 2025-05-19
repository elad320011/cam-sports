from flask import Blueprint, request
from controllers.payment import (
    create_payment,
    list_payments,
    edit_payment,
    delete_payment
)

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create', methods=['POST'])
def create():
    return create_payment()

@payment_bp.route('/list', methods=['GET'])
def list():
    return list_payments()

@payment_bp.route('/<payment_id>/edit', methods=['PUT'])
def edit(payment_id):
    return edit_payment(payment_id)

@payment_bp.route('/<payment_id>/delete', methods=['DELETE'])
def delete(payment_id):
    return delete_payment(payment_id)
