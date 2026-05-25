from __future__ import annotations

import re

FORBIDDEN_KEYWORDS = (
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "TRUNCATE",
    "CREATE",
    "GRANT",
    "REVOKE",
)


def _strip_comments(sql: str) -> str:
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    sql = re.sub(r"--.*?$", "", sql, flags=re.MULTILINE)
    return sql


def validate_sql(sql: str) -> None:
    """Validate SQL to ensure only safe SELECT queries are executed."""
    if not sql or not sql.strip():
        raise ValueError("Empty SQL generated.")

    if sql.strip().upper() == "INVALID_REQUEST":
        raise ValueError("INVALID_REQUEST")

    cleaned = _strip_comments(sql).strip()
    if not cleaned.upper().startswith("SELECT"):
        raise ValueError("Only SELECT statements are allowed.")

    for keyword in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{keyword}\b", cleaned, flags=re.IGNORECASE):
            raise ValueError(f"Forbidden SQL keyword detected: {keyword}")
