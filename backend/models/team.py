import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class Team(me.Document):
    meta = {'collection': 'teams'}
    team_id = me.StringField(required=True, unique=True)
    code = me.StringField(required=True, unique=True)  # Add this new field for the random code
    players = me.ListField(me.StringField(), default=[])  # Store player usernames
    management = me.ListField(me.StringField(), default=[])    # Store management usernames
    payment_method = me.StringField()
