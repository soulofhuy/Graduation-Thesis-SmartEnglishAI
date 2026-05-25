from __future__ import annotations

ANALYSIS_PROMPT_TEMPLATE = """
You are a professional data analyst.

You will receive:
1. User question
2. SQL query
3. Database result

Your task:
* Explain result in natural language.
* Provide useful observations.
* Provide statistics when possible.
* Highlight trends when possible.
* Explain empty result if no records found.
* Be concise but informative.

Question:
{question}

SQL:
{sql}

Result:
{result}
""".strip()


def build_analysis_prompt(question: str, sql: str, result: str) -> str:
    return ANALYSIS_PROMPT_TEMPLATE.format(question=question, sql=sql, result=result)
