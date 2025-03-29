#!/bin/bash
# Activate the virtual environment
source venv/bin/activate

# Install requirements
pip3 install -r requirements.txt

# Run the app
python3 app.py
