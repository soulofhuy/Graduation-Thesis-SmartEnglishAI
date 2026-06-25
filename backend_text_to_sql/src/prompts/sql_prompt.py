from __future__ import annotations

from typing import List, Dict

SQL_PROMPT_TEMPLATE = """
You are an expert PostgreSQL SQL generator.
You convert natural language into PostgreSQL SQL.

Rules:
1. Return SQL only.
2. Do not explain.
3. Do not return markdown.
4. Do not return ```sql.
5. Use only tables from schema.
6. Use only columns from schema.
7. Never invent tables.
8. Never invent columns.
9. Use JOIN when necessary.
10. Use PostgreSQL syntax.
11. Generate efficient SQL.
12. Never generate INSERT.
13. Never generate UPDATE.
14. Never generate DELETE.
15. Never generate DROP.
16. Never generate ALTER.
17. Never generate TRUNCATE.
18. Never generate CREATE.
19. Only generate SELECT statements.
20. If question cannot be answered using schema return INVALID_REQUEST.
21. Use conversation history to resolve references like "that student", "those records", "the same class", etc.

Schema:
{schema}

{history_block}
Current question:
{question}

Output:
SQL only.
""".strip()


def _build_history_block(conversation_history: List[Dict[str, str]]) -> str:
    if not conversation_history:
        return ""
    lines = ["Conversation history (use this to understand follow-up questions):"]
    for turn in conversation_history:
        role = turn.get("role", "")
        content = turn.get("content", "").strip()
        if role == "user":
            lines.append(f"User: {content}")
        elif role == "assistant":
            lines.append(f"Assistant: {content}")
    lines.append("")
    return "\n".join(lines) + "\n"


def build_sql_prompt(schema: str, question: str, conversation_history: List[Dict[str, str]] | None = None) -> str:
    history_block = _build_history_block(conversation_history or [])
    return SQL_PROMPT_TEMPLATE.format(schema=schema, question=question, history_block=history_block)
