from __future__ import annotations

import logging

from flask import request, jsonify

from src.services.chat_service import process_message

logger = logging.getLogger(__name__)


def handle_chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message", "")).strip()

    if not message:
        return jsonify({
            "success": False,
            "error": {
                "type": "ValidationError",
                "message": "Message is required",
            },
        }), 400

    try:
        result = process_message(message)
        if result.get("success"):
            return jsonify(result), 200

        error_type = (result.get("error") or {}).get("type", "")
        status = 400 if error_type in {"InvalidRequest", "ValidationError"} else 500
        return jsonify(result), status
    except FileNotFoundError as exc:
        logger.exception("Schema file not found")
        return jsonify({
            "success": False,
            "error": {
                "type": "SchemaNotFound",
                "message": str(exc),
            },
        }), 500
    except ValueError as exc:
        logger.exception("SQL validation error")
        return jsonify({
            "success": False,
            "error": {
                "type": "InvalidSQL",
                "message": str(exc),
            },
        }), 400
    except Exception as exc:
        logger.exception("Unhandled error in /api/chat")
        return jsonify({
            "success": False,
            "error": {
                "type": exc.__class__.__name__,
                "message": "Internal Server Error",
            },
        }), 500
