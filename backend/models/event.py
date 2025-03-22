import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class Event(me.Document):
    title = me.StringField(required=True)
    event_date = me.DateTimeField(required=True)
    description = me.StringField()
    attendees = me.ListField(me.StringField()) # List of user ids
