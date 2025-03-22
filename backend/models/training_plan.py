import mongoengine as me
import os

# Load environment variables
MONGODB_URI = os.getenv('MONGODB_URI')

me.connect(host = MONGODB_URI)


class PlanSource(me.EmbeddedDocument):
    source_type = me.StringField(required=True, choices=["Image", "Video"]) # Image / video
    source_url = me.StringField(required=True)


class PlanSection(me.EmbeddedDocument):
    name = me.StringField(required=True)
    description = me.StringField() # Describes the drill
    sources = me.ListField(field=me.EmbeddedDocumentField(PlanSource), default = []) # List of sources (images, videos and such)


class TrainingPlan(me.Document):
    name = me.StringField(required=True)
    team_id = me.StringField(required=True)
    plan_sections = me.ListField(field=me.EmbeddedDocumentField(PlanSection), default = {})
    description = me.StringField()
