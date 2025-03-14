from flask import Flask
import os
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS

# Routes
from routes.auth import auth_bp
from routes.ai_advior import ai_advior_bp
from routes.game_statistics import game_statistics_bp
from routes.payment import payment_bp
from routes.team import team_bp

# Models
from models.user import User  # Add this line

load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS

# Routes
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(ai_advior_bp, url_prefix='/ai_advior')
app.register_blueprint(game_statistics_bp, url_prefix='/game_statistics')
app.register_blueprint(payment_bp, url_prefix='/payment')
app.register_blueprint(team_bp, url_prefix='/team')

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
