import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Player(me.Document):
    meta = {'collection': 'players'}
    username = me.StringField(required=True, unique=True)
    password = me.StringField(required=True)
    team_id = me.StringField(default='') 