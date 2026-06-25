from __future__ import annotations

import json
from typing import Any, Dict

from src.services.gemini_service import generate_analysis as gemini_generate_analysis


def generate_analysis(question: str, sql: str, result: Dict[str, Any], conversation_history: list | None = None) -> str:
    result_payload = json.dumps(result, ensure_ascii=True, default=str)
    return gemini_generate_analysis(question=question, sql=sql, result_payload=result_payload, conversation_history=conversation_history)
