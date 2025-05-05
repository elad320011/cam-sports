import mongoengine as me

class Footage(me.Document):
    team_id = me.StringField(required=True)
    user_id = me.StringField(required=True)
    title = me.StringField(required=True)
    url = me.StringField(required=True)
