from flask import request, jsonify
import os
import mongoengine as me
from models.team import Team

def update_payment_method(request):
    data = request.get_json()
    payment_method = data.get('payment_method')
    current_team = data.get('team')

    team_object = Team.objects.get(name=current_team)
    team_object.update(payment_method=payment_method)
    team_object.reload()
    
    return jsonify({"message": "Payment method updated successfully"})

def get_payment_method(request):
    try:
        data = request.get_json()
        current_team = data.get('team')
        team_object = Team.objects.get(name=current_team)
        payment_method = team_object.payment_method
        return jsonify({"payment_method": payment_method}), 200
    except Team.DoesNotExist:
        return jsonify({"error": "Team not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

