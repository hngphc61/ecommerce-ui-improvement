"""Kết nối và khởi tạo cơ sở dữ liệu SQLite."""
import sqlite3
from pathlib import Path

from flask import current_app, g

BASE_DIR = Path(__file__).resolve().parent


def get_db():
    """Mỗi request dùng chung một kết nối."""
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db(path, with_sample_data=True):
    """Tạo bảng. Nếu database còn trống thì nạp dữ liệu mẫu."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    try:
        conn.executescript((BASE_DIR / "schema.sql").read_text(encoding="utf-8"))
        is_empty = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0] == 0
        if is_empty and with_sample_data:
            from seed import seed

            seed(conn)
        conn.commit()
    finally:
        conn.close()
