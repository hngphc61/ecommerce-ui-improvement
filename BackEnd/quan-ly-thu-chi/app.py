"""Ứng dụng web Quản lý thu chi cá nhân (Flask + SQLite)."""
import csv
import io
import os
import re
import sqlite3
from datetime import date
from pathlib import Path

from flask import Flask, Response, jsonify, render_template, request
from werkzeug.exceptions import HTTPException

from database import BASE_DIR, close_db, get_db, init_db

DEFAULT_DB = BASE_DIR / "instance" / "thuchi.db"
STATUSES = {"pending": "Chờ xử lý", "completed": "Hoàn thành", "cancelled": "Đã hủy"}
TYPES = {"income": "Thu", "expense": "Chi"}
MAX_AMOUNT = 1_000_000_000_000

SELECT_TRANSACTIONS = """
    SELECT t.id, t.title, t.amount, t.category_id, t.date, t.status, t.note,
           c.name AS category_name, c.type AS type
    FROM transactions t JOIN categories c ON c.id = t.category_id
"""


class ApiError(Exception):
    def __init__(self, message, code=400):
        super().__init__(message)
        self.message, self.code = message, code


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Dữ liệu gửi lên phải là JSON.")
    return data


def text_field(data, key, label, max_length, required=True):
    value = data.get(key, "")
    if not isinstance(value, str):
        raise ApiError(f"{label} không hợp lệ.")
    value = value.strip()
    if required and not value:
        raise ApiError(f"{label} không được để trống.")
    if len(value) > max_length:
        raise ApiError(f"{label} tối đa {max_length} ký tự.")
    return value


def int_field(data, key, label, minimum):
    value = data.get(key)
    if type(value) is not int or not minimum <= value <= MAX_AMOUNT:
        raise ApiError(f"{label} phải là số nguyên từ {minimum:,} đến {MAX_AMOUNT:,}.")
    return value


def validate_transaction(data):
    title = text_field(data, "title", "Nội dung", 120)
    amount = int_field(data, "amount", "Số tiền", 1)
    category_id = int_field(data, "category_id", "Danh mục", 1)
    note = text_field(data, "note", "Ghi chú", 500, required=False)
    when = data.get("date")
    try:
        if not isinstance(when, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", when):
            raise ValueError
        date.fromisoformat(when)
    except ValueError:
        raise ApiError("Ngày không hợp lệ (định dạng YYYY-MM-DD).")
    status = data.get("status", "completed")
    if status not in list(STATUSES):
        raise ApiError("Trạng thái không hợp lệ.")
    if not get_db().execute("SELECT 1 FROM categories WHERE id = ?", (category_id,)).fetchone():
        raise ApiError("Danh mục không tồn tại.")
    return title, amount, category_id, when, status, note


def validate_category(data):
    name = text_field(data, "name", "Tên danh mục", 50)
    kind = data.get("type")
    if kind not in list(TYPES):
        raise ApiError("Loại danh mục phải là thu hoặc chi.")
    budget = int_field({"monthly_budget": data.get("monthly_budget", 0)}, "monthly_budget", "Ngân sách", 0)
    return name, kind, budget if kind == "expense" else 0


def month_arg():
    month = request.args.get("month", "")
    if month and not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", month):
        raise ApiError("Tháng không hợp lệ (định dạng YYYY-MM).")
    return month


def filtered_transactions():
    """Lọc giao dịch theo tháng, loại, trạng thái, danh mục và từ khóa."""
    where, params = [], []
    if month := month_arg():
        where.append("substr(t.date, 1, 7) = ?")
        params.append(month)
    for key, column in (("type", "c.type"), ("status", "t.status"), ("category_id", "t.category_id")):
        if value := request.args.get(key):
            where.append(f"{column} = ?")
            params.append(value)
    sql = SELECT_TRANSACTIONS + (" WHERE " + " AND ".join(where) if where else "")
    rows = [dict(r) for r in get_db().execute(sql + " ORDER BY t.date DESC, t.id DESC", params)]
    # Tìm kiếm bằng Python vì LIKE của SQLite không bỏ phân biệt hoa/thường với tiếng Việt
    if keyword := request.args.get("q", "").strip().casefold():
        rows = [r for r in rows if keyword in f"{r['title']} {r['note']}".casefold()]
    return rows


def find_transaction(transaction_id):
    row = get_db().execute(SELECT_TRANSACTIONS + " WHERE t.id = ?", (transaction_id,)).fetchone()
    if row is None:
        raise ApiError("Không tìm thấy giao dịch.", 404)
    return dict(row)


def find_category(category_id):
    row = get_db().execute("SELECT * FROM categories WHERE id = ?", (category_id,)).fetchone()
    if row is None:
        raise ApiError("Không tìm thấy danh mục.", 404)
    return dict(row)


def create_app(db_path=DEFAULT_DB, with_sample_data=True):
    app = Flask(__name__)
    app.config["DATABASE"] = str(db_path)
    app.json.ensure_ascii = False
    app.teardown_appcontext(close_db)
    init_db(db_path, with_sample_data)

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify(error=error.message), error.code

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return jsonify(error=error.description), error.code

    @app.get("/")
    def index():
        return render_template("index.html")

    # ---------- Giao dịch ----------
    @app.get("/api/transactions")
    def list_transactions():
        return jsonify(filtered_transactions())

    @app.post("/api/transactions")
    def create_transaction():
        values = validate_transaction(json_body())
        db = get_db()
        cursor = db.execute(
            "INSERT INTO transactions (title, amount, category_id, date, status, note) VALUES (?, ?, ?, ?, ?, ?)",
            values,
        )
        db.commit()
        return jsonify(find_transaction(cursor.lastrowid)), 201

    @app.put("/api/transactions/<int:transaction_id>")
    def update_transaction(transaction_id):
        find_transaction(transaction_id)
        values = validate_transaction(json_body())
        db = get_db()
        db.execute(
            """UPDATE transactions SET title = ?, amount = ?, category_id = ?, date = ?, status = ?, note = ?,
               updated_at = datetime('now', 'localtime') WHERE id = ?""",
            (*values, transaction_id),
        )
        db.commit()
        return jsonify(find_transaction(transaction_id))

    @app.patch("/api/transactions/<int:transaction_id>/status")
    def update_status(transaction_id):
        find_transaction(transaction_id)
        status = json_body().get("status")
        if status not in list(STATUSES):
            raise ApiError("Trạng thái không hợp lệ.")
        db = get_db()
        db.execute(
            "UPDATE transactions SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
            (status, transaction_id),
        )
        db.commit()
        return jsonify(find_transaction(transaction_id))

    @app.delete("/api/transactions/<int:transaction_id>")
    def delete_transaction(transaction_id):
        find_transaction(transaction_id)
        db = get_db()
        db.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
        db.commit()
        return "", 204

    # ---------- Danh mục ----------
    @app.get("/api/categories")
    def list_categories():
        rows = get_db().execute(
            """SELECT c.*, COUNT(t.id) AS transaction_count
               FROM categories c LEFT JOIN transactions t ON t.category_id = c.id
               GROUP BY c.id ORDER BY c.type DESC, c.id"""
        )
        return jsonify([dict(r) for r in rows])

    def save_category(sql, params):
        db = get_db()
        try:
            cursor = db.execute(sql, params)
        except sqlite3.IntegrityError:
            raise ApiError("Danh mục này đã tồn tại.", 409)
        db.commit()
        return cursor

    @app.post("/api/categories")
    def create_category():
        values = validate_category(json_body())
        cursor = save_category("INSERT INTO categories (name, type, monthly_budget) VALUES (?, ?, ?)", values)
        return jsonify(find_category(cursor.lastrowid)), 201

    @app.put("/api/categories/<int:category_id>")
    def update_category(category_id):
        current = find_category(category_id)
        name, kind, budget = validate_category(json_body())
        used = get_db().execute("SELECT 1 FROM transactions WHERE category_id = ?", (category_id,)).fetchone()
        if used and kind != current["type"]:
            raise ApiError("Không thể đổi loại của danh mục đã có giao dịch.", 409)
        save_category(
            "UPDATE categories SET name = ?, type = ?, monthly_budget = ? WHERE id = ?",
            (name, kind, budget, category_id),
        )
        return jsonify(find_category(category_id))

    @app.delete("/api/categories/<int:category_id>")
    def delete_category(category_id):
        find_category(category_id)
        db = get_db()
        try:
            db.execute("DELETE FROM categories WHERE id = ?", (category_id,))
        except sqlite3.IntegrityError:
            raise ApiError("Danh mục đang có giao dịch nên không thể xóa.", 409)
        db.commit()
        return "", 204

    # ---------- Thống kê ----------
    @app.get("/api/stats")
    def stats():
        """Chỉ giao dịch 'Hoàn thành' được tính vào thu, chi và số dư."""
        month = month_arg() or date.today().strftime("%Y-%m")
        db = get_db()

        totals = {"income": 0, "expense": 0}
        for row in db.execute(
            """SELECT c.type, SUM(t.amount) AS total FROM transactions t
               JOIN categories c ON c.id = t.category_id
               WHERE t.status = 'completed' AND substr(t.date, 1, 7) = ? GROUP BY c.type""",
            (month,),
        ):
            totals[row["type"]] = row["total"]

        balance = db.execute(
            """SELECT COALESCE(SUM(CASE c.type WHEN 'income' THEN t.amount ELSE -t.amount END), 0)
               FROM transactions t JOIN categories c ON c.id = t.category_id
               WHERE t.status = 'completed' AND substr(t.date, 1, 7) <= ?""",
            (month,),
        ).fetchone()[0]

        status_counts = dict.fromkeys(STATUSES, 0)
        for row in db.execute(
            "SELECT status, COUNT(*) AS n FROM transactions WHERE substr(date, 1, 7) = ? GROUP BY status",
            (month,),
        ):
            status_counts[row["status"]] = row["n"]

        by_category = [
            dict(r)
            for r in db.execute(
                """SELECT c.id, c.name, c.monthly_budget AS budget, COALESCE(SUM(t.amount), 0) AS spent
                   FROM categories c LEFT JOIN transactions t ON t.category_id = c.id
                        AND t.status = 'completed' AND substr(t.date, 1, 7) = ?
                   WHERE c.type = 'expense' GROUP BY c.id ORDER BY spent DESC, c.id""",
                (month,),
            )
        ]

        # 6 tháng tính đến tháng đang chọn
        year, number = map(int, month.split("-"))
        monthly = []
        for back in range(5, -1, -1):
            index = year * 12 + number - 1 - back
            key = f"{index // 12:04d}-{index % 12 + 1:02d}"
            monthly.append({"month": key, "income": 0, "expense": 0})
        lookup = {m["month"]: m for m in monthly}
        for row in db.execute(
            """SELECT substr(t.date, 1, 7) AS month, c.type, SUM(t.amount) AS total
               FROM transactions t JOIN categories c ON c.id = t.category_id
               WHERE t.status = 'completed' GROUP BY 1, 2"""
        ):
            if row["month"] in lookup:
                lookup[row["month"]][row["type"]] = row["total"]

        return jsonify(
            month=month,
            income=totals["income"],
            expense=totals["expense"],
            net=totals["income"] - totals["expense"],
            balance=balance,
            status_counts=status_counts,
            by_category=by_category,
            monthly=monthly,
        )

    # ---------- Xuất CSV ----------
    @app.get("/api/export.csv")
    def export_csv():
        def safe(text):
            """Ngăn Excel hiểu nội dung người dùng nhập thành công thức."""
            return "'" + text if text.startswith(("=", "+", "-", "@", "\t", "\r")) else text

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Ngày", "Nội dung", "Loại", "Danh mục", "Số tiền (VND)", "Trạng thái", "Ghi chú"])
        for t in filtered_transactions():
            writer.writerow([
                t["date"], safe(t["title"]), TYPES[t["type"]], safe(t["category_name"]),
                t["amount"], STATUSES[t["status"]], safe(t["note"]),
            ])
        name = f"thu-chi-{month_arg() or 'tat-ca'}.csv"
        return Response(
            "﻿" + output.getvalue(),  # BOM để Excel đọc đúng tiếng Việt
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={name}"},
        )

    return app


if __name__ == "__main__":
    create_app().run(
        host="127.0.0.1",
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("FLASK_DEBUG") == "1",
    )
