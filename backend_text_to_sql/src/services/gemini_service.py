from __future__ import annotations

import logging
import os
import re

from dotenv import load_dotenv
import google.generativeai as genai

from src.prompts.analysis_prompt import build_analysis_prompt
from src.prompts.sql_prompt import build_sql_prompt

load_dotenv()

MODEL_NAME = "gemini-3-flash-preview"

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    return api_key


def _get_model() -> genai.GenerativeModel:
    logger.debug("Initializing Gemini model: %s", MODEL_NAME)
    genai.configure(api_key=_get_api_key())
    return genai.GenerativeModel(MODEL_NAME)


def _clean_sql(sql: str) -> str:
    if not sql:
        return ""
    cleaned = re.sub(r"```(?:sql)?", "", sql, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "")
    return cleaned.strip()


def generate_sql(question: str, schema: str, conversation_history: list | None = None) -> str:
    logger.info("Generating SQL with Gemini")
    logger.debug("Question length: %d, schema length: %d", len(question), len(schema))
    prompt = build_sql_prompt(schema=schema, question=question, conversation_history=conversation_history)
    model = _get_model()
    result = model.generate_content(prompt)
    return _clean_sql(result.text or "")


def generate_analysis(question: str, sql: str, result_payload: str, conversation_history: list | None = None) -> str:
    logger.info("Generating analysis with Gemini")
    prompt = build_analysis_prompt(question=question, sql=sql, result=result_payload, conversation_history=conversation_history)
    model = _get_model()
    result = model.generate_content(prompt)
    return result.text or ""
