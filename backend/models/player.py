import mongoengine as me
import os
from datetime import datetime

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Player(me.Document):
    meta = {'collection': 'players'}
    username = me.StringField(required=True, unique=True)
    password = me.StringField(required=True)
    team_id = me.StringField(default='')
    role = me.StringField(required=True)  # Player's role in the team
    birth_date = me.DateTimeField(required=True)
    weight = me.FloatField(required=True)  # in kg
    height = me.FloatField(required=True)  # in cm 