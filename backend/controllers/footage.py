from flask import request, jsonify
from models.footage import Footage;

def create_footage_method(request):
    data = request.get_json()
    footage_title = data.get('title')
    footage_url = data.get('url')
    team_id = data.get('team_id')
    user_id = data.get('user_id')


    # Check if footage already exists
    existing_footage = Footage.objects(title=footage_title, team_id=team_id, url=footage_url).first()
    if existing_footage:
        return jsonify({"message": "Footage with this name already exists"}), 400

    # Create new footage
    footage = Footage(
        title=footage_title,
        url=footage_url,
        team_id=team_id,
        user_id=user_id
    )
    footage.save()

    return jsonify({"message": "Footage created successfully", "footage_id": str(footage.id)}), 201

def get_footage_by_team(request):
    team_id = request.args.get('team_id')
    footage = Footage.objects(team_id=team_id)

    if not footage:
        return jsonify({"message": "No footage found for this team"}), 404

    footage_list = []
    for f in footage:
        footage_list.append({
            "id": str(f.id),
            "title": f.title,
            "url": f.url,
            "team_id": f.team_id,
        })

    return jsonify({"footage": footage_list}), 200

def delete_footage_method(request):
    footage_id = request.args.get('footage_id')
    footage = Footage.objects(id=footage_id).first()

    if not footage:
        return jsonify({"message": "Footage not found"}), 404

    footage.delete()
    return jsonify({"message": "Footage deleted successfully"}), 200
