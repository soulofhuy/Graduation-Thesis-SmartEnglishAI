from __future__ import annotations

import logging
from typing import Any, Dict, List

from src.config.database import get_db_connection

logger = logging.getLogger(__name__)


def execute_query(sql: str) -> Dict[str, Any]:
    """Execute SQL and return a structured result."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                logger.debug("Executing SQL")
                cur.execute(sql)
                rows = cur.fetchall()
                columns = [desc[0] for desc in cur.description] if cur.description else []
                return {
                    "success": True,
                    "columns": columns,
                    "rows": rows,
                }
    except Exception as exc:
        logger.exception("Database query failed")
        return {
            "success": False,
            "error": {
                "type": exc.__class__.__name__,
                "message": str(exc),
            },
        }
