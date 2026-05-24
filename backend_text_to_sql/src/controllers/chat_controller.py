from flask import request, jsonify

from src.services.chat_service import process_user_message


def handle_chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    try:
        result = process_user_message(message)
        return jsonify(result), 200
    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500
