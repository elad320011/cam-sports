from flask import request, jsonify
from models.training_plan import TrainingPlan, PlanSection, PlanSource
import datetime
import mongoengine as me
import json


def create_training_plan(request):

    # extract required data
    data = request.get_json()
    name = data.get('name')
    team_id = data.get('team_id')
    description = data.get('description')
    plan_sections_data = data.get('plan_sections', [])

    # check if a training plan already exists with this name
    if TrainingPlan.objects(team_id=team_id, name=name):
        return jsonify({"message": "Training plan with this name already exists"}), 400

    # create plan sections
    plan_sections = []
    for section in plan_sections_data:
        print(section)
        sources_data = section.get('sources', [])
        sources = [PlanSource(source_type=source['source_type'], source_url=source['source_url']) for source in sources_data]
        plan_section = PlanSection(name=section['name'], description=section.get('description'), sources=sources)
        plan_sections.append(plan_section)

    # create training plan
    training_plan = TrainingPlan(
        name=name,
        team_id=team_id,
        description=description,
        plan_sections=plan_sections
    )
    training_plan.save()

    plan_id = str(training_plan.id)

    return jsonify({"message": "Training plan created successfully", "plan_id": plan_id}), 201

def get_training_plan_by_team_id(team_id):
    training_plans = TrainingPlan.objects(team_id=team_id)
    result = []

    for plan in training_plans:
        plan_dict = plan.to_mongo().to_dict()
        plan_dict['id'] = str(plan_dict.pop('_id'))
        result.append(plan_dict)

    training_plans_json = json.dumps(result)

    return json.dumps({"plans": training_plans_json}), 200

def delete_training_plan(team_id, plan_id):
    try:
        training_plan = TrainingPlan.objects.get(id=plan_id, team_id=team_id)
        training_plan.delete()
        return jsonify({"message": "Training plan deleted successfully"}), 200
    except me.DoesNotExist:
        return jsonify({"message": "Training plan not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def edit_training_plan(request, plan_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    plan_sections_data = data.get('plan_sections', [])

    # find the training plan by id
    try:
        training_plan = TrainingPlan.objects.get(id=plan_id)
    except me.DoesNotExist:
        return jsonify({"message": "Training plan not found"}), 404

    # update the training plan
    training_plan.name = name
    training_plan.description = description

    # update plan sections
    plan_sections = []
    for section in plan_sections_data:
        if 'name' not in section:
            return jsonify({"message": "Each section must have a 'name' field"}), 400
        sources_data = section.get('sources', [])
        sources = [
            PlanSource(
                source_type=source.get('source_type', ''),
                source_url=source.get('source_url', '')
            )
            for source in sources_data
        ]
        plan_section = PlanSection(
            name=section['name'],
            description=section.get('description', ''),
            sources=sources
        )
        plan_sections.append(plan_section)

    training_plan.plan_sections = plan_sections
    training_plan.save()

    return jsonify({"message": "Training plan updated successfully"}), 200

def get_training_plan_by_id(plan_id):
    try:
        training_plan = TrainingPlan.objects.get(id=plan_id)
        return jsonify({
            "id": str(training_plan.id),
            "name": training_plan.name,
            "description": training_plan.description,
            "team_id": training_plan.team_id,
            "plan_sections": [
                {
                    "name": section.name,
                    "description": section.description,
                    "sources": [
                        {
                            "source_type": source.source_type,
                            "source_url": source.source_url
                        }
                        for source in section.sources
                    ]
                }
                for section in training_plan.plan_sections
            ]
        }), 200
    except me.DoesNotExist:
        return jsonify({"message": "Training plan not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
