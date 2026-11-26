"use strict";
// Mỗi bài kiểm thử dùng một database tạm, không đụng tới dữ liệu thật.
const tests = [];
const test = (name, run) => tests.push({ name, run });
function equal(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`mong đợi ${JSON.stringify(expected)}, nhận ${JSON.stringify(actual)}`);
  }
}
async function fails(promise) {
  try { await promise; } catch { return; }
  throw new Error("lẽ ra phải báo lỗi");
}
const payload = (category_id, changes = {}) => ({
  title: "Cơm trưa", amount: 35000, category_id, date: "2026-11-10", status: "completed", note: "", ...changes,
});

test("Thêm, sửa, xóa giao dịch", async (s, food) => {
  const { id } = await s.saveTransaction(payload(food));
  await s.saveTransaction(payload(food, { title: "Cơm tối" }), id);
  equal((await s.listTransactions()).map((t) => t.title), ["Cơm tối"]);
  await s.deleteTransaction(id);
  equal(await s.listTransactions(), []);
  await fails(s.deleteTransaction(id));
});

test("Cập nhật trạng thái làm thay đổi thống kê", async (s, food) => {
  const { id } = await s.saveTransaction(payload(food, { status: "pending" }));
  equal((await s.stats("2026-11")).expense, 0);
  await s.setStatus(id, "completed");
  equal((await s.stats("2026-11")).expense, 35000);
  await fails(s.setStatus(id, "xong"));
});

test("Thống kê thu, chi, số dư", async (s, food, salary) => {
  await s.saveTransaction(payload(salary, { amount: 1000000, date: "2026-10-05" }));
  await s.saveTransaction(payload(salary, { amount: 500000 }));
  await s.saveTransaction(payload(food, { amount: 120000 }));
  const r = await s.stats("2026-11");
  equal([r.income, r.expense, r.net, r.balance], [500000, 120000, 380000, 1380000]);
  equal([r.by_category[0].spent, r.monthly[4].income], [120000, 1000000]);
});

test("Từ chối dữ liệu không hợp lệ", async (s, food) => {
  for (const changes of [{ title: "  " }, { amount: 0 }, { amount: 1.5 }, { date: "2026-02-30" }, { category_id: 999 }, { status: "x" }]) {
    await fails(s.saveTransaction(payload(food, changes)));
  }
  equal(await s.listTransactions(), []);
});

test("Quy tắc danh mục", async (s, food, salary) => {
  await fails(s.saveCategory({ name: "Ăn uống", type: "expense" }));
  await s.saveTransaction(payload(food));
  await fails(s.deleteCategory(food));
  await fails(s.saveCategory({ name: "Ăn uống", type: "income" }, food));
  await s.deleteCategory(salary);
  equal((await s.listCategories()).length, 1);
});

test("Tìm kiếm, lọc, xuất CSV", async (s, food) => {
  await s.saveTransaction(payload(food, { title: "Ăn sáng" }));
  await s.saveTransaction(payload(food, { title: "=1+1", status: "pending" }));
  equal((await s.listTransactions({ q: "ăn SÁNG" })).map((t) => t.title), ["Ăn sáng"]);
  equal((await s.listTransactions({ status: "pending" })).length, 1);
  equal(toCsv(await s.listTransactions()).includes(`"'=1+1"`), true);
});

(async () => {
  const lines = [];
  let passed = 0;
  for (const [index, { name, run }] of tests.entries()) {
    const dbName = `test-${Date.now()}-${index}`;
    let store;
    try {
      store = await createStore(dbName, false);
      const food = await store.saveCategory({ name: "Ăn uống", type: "expense", monthly_budget: 100000 });
      const salary = await store.saveCategory({ name: "Lương", type: "income" });
      await run(store, food.id, salary.id);
      passed++;
      lines.push(`ĐẠT   ${name}`);
    } catch (error) {
      lines.push(`LỖI   ${name}: ${error.message}`);
    } finally {
      store?.close();
      indexedDB.deleteDatabase(dbName);
    }
  }
  lines.push("", `Kết quả: ${passed}/${tests.length} bài đạt`);
  document.querySelector("#output").textContent = lines.join("\n");
})();
