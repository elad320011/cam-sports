import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Formation(me.Document):
    meta = {'collection': 'formations'}
    name = me.StringField(required=True)  # Name of the formation
    team_id = me.StringField(required=True)  # Reference to the team
    role_1 = me.ReferenceField('Role', required=True)  # Role 1
    role_2 = me.ReferenceField('Role', required=True)  # Role 2
    role_3 = me.ReferenceField('Role', required=True)  # Role 3
    role_4 = me.ReferenceField('Role', required=True)  # Role 4
    role_5 = me.ReferenceField('Role', required=True)  # Role 5
    role_6 = me.ReferenceField('Role', required=True)  # Role 6
