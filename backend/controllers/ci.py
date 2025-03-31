

import os
import subprocess
from flask import jsonify


def trigger_ci(request):
    data = request.get_json()
    if data.get('hash_key') != os.getenv('CI_HASH_KEY'):
        return jsonify({"error": "Invalid hash key"}), 403
    else:
        process = subprocess.Popen(
            ["./run.sh"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return jsonify({"message": "CI process triggered successfully"}), 200

