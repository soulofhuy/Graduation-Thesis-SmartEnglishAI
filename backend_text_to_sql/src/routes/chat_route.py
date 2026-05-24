from flask import Blueprint

from src.controllers.chat_controller import handle_chat

chat_bp = Blueprint("chat", __name__)

chat_bp.route("/ask", methods=["POST"])(handle_chat)
