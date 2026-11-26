"""Dữ liệu mẫu cho 6 tháng gần nhất.

Chạy `python seed.py` để XÓA database hiện tại và tạo lại dữ liệu mẫu.
"""
import random
from datetime import date

CATEGORIES = [
    # (tên, loại, ngân sách tháng)
    ("Lương làm thêm", "income", 0),
    ("Gia đình gửi", "income", 0),
    ("Học bổng", "income", 0),
    ("Ăn uống", "expense", 2_500_000),
    ("Nhà trọ", "expense", 2_200_000),
    ("Đi lại", "expense", 500_000),
    ("Học tập", "expense", 800_000),
    ("Giải trí", "expense", 600_000),
    ("Mua sắm", "expense", 700_000),
]

# (tiêu đề, danh mục, số tiền thấp nhất, cao nhất, ngày trong tháng)
MONTHLY = [
    ("Gia đình gửi hằng tháng", "Gia đình gửi", 4_000_000, 4_000_000, 1),
    ("Lương part-time", "Lương làm thêm", 2_800_000, 3_600_000, 5),
    ("Tiền trọ và điện nước", "Nhà trọ", 1_900_000, 2_150_000, 3),
    ("Đi chợ đầu tháng", "Ăn uống", 500_000, 800_000, 2),
    ("Cơm trưa tại trường", "Ăn uống", 350_000, 600_000, 9),
    ("Ăn tối cùng bạn", "Ăn uống", 150_000, 400_000, 16),
    ("Đi chợ giữa tháng", "Ăn uống", 400_000, 700_000, 19),
    ("Đổ xăng", "Đi lại", 150_000, 250_000, 7),
    ("Gửi xe tháng", "Đi lại", 100_000, 150_000, 4),
    ("Mua giáo trình, in tài liệu", "Học tập", 150_000, 650_000, 11),
    ("Xem phim cuối tuần", "Giải trí", 120_000, 300_000, 14),
    ("Cà phê học nhóm", "Giải trí", 80_000, 220_000, 22),
    ("Mua đồ dùng cá nhân", "Mua sắm", 200_000, 750_000, 18),
]


def seed(conn, today=None):
    today = today or date.today()
    rng = random.Random(2026)
    conn.executemany(
        "INSERT INTO categories (name, type, monthly_budget) VALUES (?, ?, ?)", CATEGORIES
    )
    ids = {name: cid for cid, name in conn.execute("SELECT id, name FROM categories")}

    rows = []
    for back in range(5, -1, -1):
        index = today.year * 12 + today.month - 1 - back
        year, month = index // 12, index % 12 + 1
        for title, category, low, high, day in MONTHLY:
            when = date(year, month, day)
            amount = rng.randrange(low, high + 1, 10_000)
            status = "completed" if when <= today else "pending"
            rows.append((title, amount, ids[category], when.isoformat(), status, ""))

    iso = today.isoformat()
    rows += [
        ("Học bổng khuyến khích học tập", 3_000_000, ids["Học bổng"], iso, "pending", "Chờ nhà trường chuyển khoản"),
        ("Đặt vé xem ca nhạc", 450_000, ids["Giải trí"], iso, "cancelled", "Đã hủy vé"),
    ]
    conn.executemany(
        "INSERT INTO transactions (title, amount, category_id, date, status, note) VALUES (?, ?, ?, ?, ?, ?)",
        rows,
    )


if __name__ == "__main__":
    from app import DEFAULT_DB
    from database import init_db

    DEFAULT_DB.unlink(missing_ok=True)
    init_db(DEFAULT_DB)
    print(f"Đã tạo lại dữ liệu mẫu tại {DEFAULT_DB}")
