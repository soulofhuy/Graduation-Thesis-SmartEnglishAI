from dotenv import load_dotenv
import os

from flask import Flask, jsonify
from flask_cors import CORS

from src.routes.chat_route import chat_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(chat_bp, url_prefix="/api/chat")


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
