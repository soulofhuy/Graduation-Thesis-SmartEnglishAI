from src.services.gemini_service import generate_sql, generate_answer
from src.services.database_service import execute_raw_query


def process_user_message(message: str):
    sql = generate_sql(message)

    if not sql.upper().startswith("SELECT"):
        return {
            "answer": "Unable to generate a safe SELECT query.",
            "sql": sql,
            "data": []
        }

    data = execute_raw_query(sql)
    answer = generate_answer(message, data)

    return {
        "answer": answer,
        "sql": sql,
        "data": data
    }
