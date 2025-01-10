from flask import Flask
from routes.auth import auth_bp

app = Flask(__name__)

# Routes
app.register_blueprint(auth_bp, url_prefix='/auth')


if __name__ == '__main__':
    app.run()