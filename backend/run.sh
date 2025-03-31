#!/bin/bash

# Configuration
APP_NAME="flask-app"
VENV_PATH="./venv"
APP_FILE="app.py"
LOG_FILE="app.log"
PID_FILE="app.pid"

# Stop existing app
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    echo "Stopping existing app with PID $PID..."
    kill "$PID" && rm "$PID_FILE"
else
    echo "No running app found."
fi

# Pull latest code
echo "Pulling latest code..."
git pull

# Activate venv and install requirements
echo "Activating venv and installing requirements..."
source "$VENV_PATH/bin/activate"
pip install -r requirements.txt

# Start the app in the background
echo "Starting app..."
nohup python3 "$APP_FILE" > "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE"
echo "App started with PID $(cat $PID_FILE)"

