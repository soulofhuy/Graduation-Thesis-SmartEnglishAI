from src.config.db import get_db_connection


def execute_raw_query(sql_query: str):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql_query)
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description] if cur.description else []
            return [dict(zip(columns, row)) for row in rows]
