from dotenv import load_dotenv
import os
import re

import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLEAPI"))


def _read_schema() -> str:
    schema_path = os.getenv("SCHEMA_PATH", "schema.prisma")
    if os.path.isfile(schema_path):
        with open(schema_path, "r", encoding="utf-8") as schema_file:
            return schema_file.read()
    return ""


def _clean_sql(sql: str) -> str:
    if not sql:
        return ""
    cleaned = re.sub(r"```(?:sql)?", "", sql, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "")
    return cleaned.strip()


def generate_sql(user_question: str) -> str:
    schema = _read_schema()
    prompt = (
        "You are a PostgreSQL expert. Based on the schema below, return ONLY a SELECT SQL query. "
        "No markdown, no explanation.\n"
        f"Schema:\n{schema}\n\n"
        f"Question: {user_question}"
    )

    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content(prompt)
    return _clean_sql(result.text or "")


def generate_answer(user_question: str, data) -> str:
    prompt = (
        "Based on the query result below, answer the user's question in a friendly and concise way. "
        "If data is empty, say no matching results were found. "
        "Respond in the SAME language as the user's question.\n"
        f"Question: {user_question}\n"
        f"Data: {data}"
    )

    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content(prompt)
    return result.text or ""
