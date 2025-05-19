import mongoengine as me
import os

MONGODB_URI = os.getenv('MONGODB_URI')
me.connect(host=MONGODB_URI)

class Reminder(me.EmbeddedDocument):
    date = me.DateTimeField(required=True)
    created_at = me.DateTimeField(default=me.datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=me.datetime.datetime.utcnow)

class Payment(me.Document):
    meta = {'collection': 'payments'}
    link = me.StringField(required=True)
    amount = me.FloatField(required=True)
    description = me.StringField()
    due_date = me.DateTimeField(required=True)
    team_id = me.StringField(required=True)
    reminders = me.EmbeddedDocumentListField(Reminder, default=list)
    created_at = me.DateTimeField(default=me.datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=me.datetime.datetime.utcnow)
