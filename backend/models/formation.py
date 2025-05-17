import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Formation(me.Document):
    meta = {'collection': 'formations'}
    name = me.StringField(required=True)  # Name of the formation
    team_id = me.StringField(required=True)  # Reference to the team
    role_1 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
    role_2 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
    role_3 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
    role_4 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
    role_5 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
    role_6 = me.DictField(default={
        'player_id': None,
        'instructions': ''
    })
