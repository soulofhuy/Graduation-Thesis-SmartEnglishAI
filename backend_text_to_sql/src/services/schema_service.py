from __future__ import annotations

import os
from pathlib import Path
from threading import Lock
from typing import Optional

_SCHEMA_LOCK = Lock()
_SCHEMA_PATH: Optional[Path] = None
_SCHEMA_MTIME: Optional[float] = None
_SCHEMA_CONTENT: str = ""


def _resolve_schema_path() -> Path:
    project_root = Path(__file__).resolve().parents[2]

    return (project_root / "prisma" / "schema.prisma").resolve()


def get_schema() -> str:
    """Return Prisma schema contents with basic caching."""
    global _SCHEMA_PATH, _SCHEMA_MTIME, _SCHEMA_CONTENT

    path = _resolve_schema_path()
    if not path.exists():
        raise FileNotFoundError(f"Schema file not found: {path}")

    with _SCHEMA_LOCK:
        mtime = path.stat().st_mtime
        if _SCHEMA_PATH != path or _SCHEMA_MTIME != mtime:
            _SCHEMA_CONTENT = path.read_text(encoding="utf-8")
            _SCHEMA_PATH = path
            _SCHEMA_MTIME = mtime

    return _SCHEMA_CONTENT
