from __future__ import annotations

from typing import List, Dict

ANALYSIS_PROMPT_TEMPLATE = """
You are a professional data analyst.

You will receive:
1. User question
2. SQL query
3. Database result
4. Conversation history (if any)

Your task:
* Explain result in natural language.
* Provide useful observations.
* Provide statistics when possible.
* Highlight trends when possible.
* Explain empty result if no records found.
* Be concise but informative.
* Use conversation history to give context-aware answers that reference prior questions/results.

{history_block}
Question:
{question}

SQL:
{sql}

Result:
{result}
""".strip()


def _build_history_block(conversation_history: List[Dict[str, str]]) -> str:
    if not conversation_history:
        return ""
    lines = ["Conversation history (use this for context-aware answers):"]
    for turn in conversation_history:
        role = turn.get("role", "")
        content = turn.get("content", "").strip()
        if role == "user":
            lines.append(f"User: {content}")
        elif role == "assistant":
            lines.append(f"Assistant: {content}")
    lines.append("")
    return "\n".join(lines) + "\n"


def build_analysis_prompt(question: str, sql: str, result: str, conversation_history: List[Dict[str, str]] | None = None) -> str:
    history_block = _build_history_block(conversation_history or [])
    return ANALYSIS_PROMPT_TEMPLATE.format(question=question, sql=sql, result=result, history_block=history_block)
