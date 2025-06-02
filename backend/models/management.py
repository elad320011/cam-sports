import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Management(me.Document):
    meta = {'collection': 'management'}
    email = me.StringField(required=True, unique=True)
    full_name = me.StringField(required=True)
    password = me.StringField(required=True)
    team_id = me.ObjectIdField()
    push_token = me.StringField(required=False, default=None)  # For push notifications 