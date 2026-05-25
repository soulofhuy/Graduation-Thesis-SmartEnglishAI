from __future__ import annotations

import os

import psycopg2 as psy


def get_db_connection() -> psy.extensions.connection:
    """Create a database connection using DATABASE_URL."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not set.")
    return psy.connect(database_url)
