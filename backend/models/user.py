import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host=MONGODB_URI)

class User(me.Document):
    username = me.StringField(required=True, unique=True)
    password = me.StringField(required=True)
    user_type = me.StringField(required=True, choices=['player', 'coach', 'staff', 'team_owner'])
    team = me.ReferenceField('Team', required=False)
    team_name = me.StringField(required=False)
