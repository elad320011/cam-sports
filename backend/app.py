from flask import Flask
import os
from dotenv import load_dotenv

# Routes
from routes.auth import auth_bp
from routes.ai_advior import ai_advior_bp
from routes.game_statistics import game_statistics_bp


load_dotenv()
app = Flask(__name__)

# Routes
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(ai_advior_bp, url_prefix='/ai_advior')
app.register_blueprint(game_statistics_bp, url_prefix='/game_statistics')

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
