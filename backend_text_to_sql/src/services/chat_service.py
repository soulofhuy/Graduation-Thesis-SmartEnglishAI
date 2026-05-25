from __future__ import annotations

import logging
from typing import Any, Dict

from src.services.analysis_service import generate_analysis
from src.services.database_service import execute_query
from src.services.gemini_service import generate_sql
from src.services.schema_service import get_schema
from src.utils.sql_validator import validate_sql

logger = logging.getLogger(__name__)


def process_message(message: str) -> Dict[str, Any]:
    logger.info("Processing message")
    logger.debug("Message length: %d", len(message))
    schema = get_schema()
    logger.debug("Schema length: %d", len(schema))
    sql = generate_sql(message, schema)
    logger.info("Generated SQL")
    logger.debug("SQL: %s", sql)

    try:
        validate_sql(sql)
    except ValueError as exc:
        logger.warning("SQL validation failed: %s", str(exc))
        if str(exc) == "INVALID_REQUEST":
            return {
                "success": False,
                "error": {
                    "type": "InvalidRequest",
                    "message": "Question cannot be answered using schema.",
                },
            }
        raise

    result = execute_query(sql)
    if not result.get("success"):
        logger.error("Database execution failed: %s", result.get("error"))
        return {
            "success": False,
            "question": message,
            "sql": sql,
            "error": result.get("error"),
        }

    analysis = generate_analysis(message, sql, result)
    logger.info("Generated analysis")
    logger.debug("Analysis length: %d", len(analysis))
    return {
        "success": True,
        "question": message,
        "sql": sql,
        "columns": result.get("columns", []),
        "rows": result.get("rows", []),
        "analysis": analysis,
    }
