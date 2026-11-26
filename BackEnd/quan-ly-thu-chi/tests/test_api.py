"""Kiểm thử API. Chạy: python -m unittest discover tests -v"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402


class ApiTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        app = create_app(Path(self.tmp.name) / "test.db", with_sample_data=False)
        self.client = app.test_client()
        self.food = self.add_category("Ăn uống", "expense", 100_000)
        self.salary = self.add_category("Lương", "income")

    def tearDown(self):
        self.tmp.cleanup()

    def add_category(self, name, kind, budget=0):
        response = self.client.post("/api/categories", json={"name": name, "type": kind, "monthly_budget": budget})
        self.assertEqual(response.status_code, 201)
        return response.get_json()["id"]

    def payload(self, **changes):
        data = {"title": "Cơm trưa", "amount": 35_000, "category_id": self.food,
                "date": "2026-11-10", "status": "completed", "note": ""}
        return {**data, **changes}

    def add(self, **changes):
        response = self.client.post("/api/transactions", json=self.payload(**changes))
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["id"]

    def stats(self):
        return self.client.get("/api/stats?month=2026-11").get_json()

    def test_create_update_delete(self):
        tid = self.add()
        response = self.client.put(f"/api/transactions/{tid}", json=self.payload(title="Cơm tối", amount=50_000))
        self.assertEqual(response.get_json()["title"], "Cơm tối")
        self.assertEqual(self.client.delete(f"/api/transactions/{tid}").status_code, 204)
        self.assertEqual(self.client.get("/api/transactions").get_json(), [])
        self.assertEqual(self.client.delete(f"/api/transactions/{tid}").status_code, 404)

    def test_status_changes_statistics(self):
        tid = self.add(status="pending")
        self.assertEqual(self.stats()["expense"], 0)
        self.client.patch(f"/api/transactions/{tid}/status", json={"status": "completed"})
        self.assertEqual(self.stats()["expense"], 35_000)
        bad = self.client.patch(f"/api/transactions/{tid}/status", json={"status": "xong"})
        self.assertEqual(bad.status_code, 400)

    def test_statistics(self):
        self.add(amount=1_000_000, category_id=self.salary, date="2026-10-05")
        self.add(amount=500_000, category_id=self.salary)
        self.add(amount=120_000)
        data = self.stats()
        self.assertEqual((data["income"], data["expense"], data["net"], data["balance"]),
                         (500_000, 120_000, 380_000, 1_380_000))
        self.assertEqual(data["by_category"][0]["spent"], 120_000)
        self.assertEqual(data["monthly"][-2]["income"], 1_000_000)

    def test_validation(self):
        for changes in ({"title": "  "}, {"amount": 0}, {"amount": -5}, {"amount": 1.5}, {"amount": True},
                        {"date": "2026-02-30"}, {"category_id": 999}, {"status": []}):
            with self.subTest(changes=changes):
                response = self.client.post("/api/transactions", json=self.payload(**changes))
                self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.get("/api/stats?month=2026-13").status_code, 400)

    def test_category_rules(self):
        duplicate = self.client.post("/api/categories", json={"name": "Ăn uống", "type": "expense"})
        self.assertEqual(duplicate.status_code, 409)
        self.add()
        self.assertEqual(self.client.delete(f"/api/categories/{self.food}").status_code, 409)
        change = self.client.put(f"/api/categories/{self.food}", json={"name": "Ăn uống", "type": "income"})
        self.assertEqual(change.status_code, 409)
        self.assertEqual(self.client.delete(f"/api/categories/{self.salary}").status_code, 204)

    def test_search_filter_export(self):
        self.add(title="Ăn sáng")
        self.add(title="=1+1", status="pending")
        found = self.client.get("/api/transactions?q=ăn SÁNG").get_json()
        self.assertEqual([t["title"] for t in found], ["Ăn sáng"])
        self.assertEqual(len(self.client.get("/api/transactions?status=pending").get_json()), 1)
        text = self.client.get("/api/export.csv?month=2026-11").data.decode("utf-8-sig")
        self.assertIn("'=1+1", text)
        self.assertIn("Ăn sáng", text)


if __name__ == "__main__":
    unittest.main()
