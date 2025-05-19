from flask import Flask
import os
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS
from flask_apscheduler import APScheduler

# Routes
from routes.auth import auth_bp
from routes.ai_advior import ai_advior_bp
from routes.game_statistics import game_statistics_bp
from routes.payment import payment_bp
from routes.team import team_bp
from routes.training_plans import training_plans_bp
from routes.calendar import calendar_bp
from routes.events import calendar_events_bp
from routes.ci import ci_bp
from routes.formations import formations_bp
from routes.message_board_routes import message_board_bp
from routes.footage import footage_bp
from routes.player import player_bp
from routes.management import management_bp

load_dotenv()
app = Flask(__name__)
scheduler = APScheduler()

# Configure CORS - Allow all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": "*",
        "expose_headers": "*",
        "supports_credentials": True
    }
})

# Configure APScheduler
app.config['SCHEDULER_API_ENABLED'] = True
app.config['SCHEDULER_TIMEZONE'] = "UTC"

# Initialize scheduler
scheduler.init_app(app)

# Routes
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(ai_advior_bp, url_prefix='/ai_advior')
app.register_blueprint(game_statistics_bp, url_prefix='/game_statistics')
app.register_blueprint(calendar_bp, url_prefix='/calendar')
app.register_blueprint(calendar_events_bp, url_prefix='/events')
app.register_blueprint(payment_bp, url_prefix='/payment')
app.register_blueprint(team_bp, url_prefix='/team')
app.register_blueprint(training_plans_bp, url_prefix='/training_plans')
app.register_blueprint(ci_bp, url_prefix='/ci')
app.register_blueprint(formations_bp, url_prefix='/formations')
app.register_blueprint(message_board_bp, url_prefix='/message_board')
app.register_blueprint(footage_bp, url_prefix='/footage')
app.register_blueprint(player_bp, url_prefix='/player')
app.register_blueprint(management_bp, url_prefix='/management')

# Start the scheduler
scheduler.start()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
