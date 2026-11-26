"use strict";
// Xử lý nghiệp vụ: kiểm tra dữ liệu, thêm - sửa - xóa, thống kê, xuất CSV.

const STATUS = { completed: "Hoàn thành", pending: "Chờ xử lý", cancelled: "Đã hủy" };
const TYPES = { income: "Thu", expense: "Chi" };
const MAX_AMOUNT = 1000000000000;

function checkText(value, label, maxLength, required = true) {
  if (typeof value !== "string") throw new Error(`${label} không hợp lệ.`);
  const text = value.trim();
  if (required && !text) throw new Error(`${label} không được để trống.`);
  if (text.length > maxLength) throw new Error(`${label} tối đa ${maxLength} ký tự.`);
  return text;
}

function checkInteger(value, label, minimum) {
  if (!Number.isInteger(value) || value < minimum || value > MAX_AMOUNT) {
    throw new Error(`${label} phải là số nguyên hợp lệ, nhỏ nhất là ${minimum}.`);
  }
  return value;
}

function checkDate(value) {
  const valid = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().startsWith(value);
  if (!valid) throw new Error("Ngày không hợp lệ.");
  return value;
}

function checkStatus(value) {
  if (!Object.keys(STATUS).includes(value)) throw new Error("Trạng thái không hợp lệ.");
  return value;
}

function cleanTransaction(data) {
  return {
    title: checkText(data.title, "Nội dung", 120),
    amount: checkInteger(data.amount, "Số tiền", 1),
    category_id: checkInteger(data.category_id, "Danh mục", 1),
    date: checkDate(data.date),
    status: checkStatus(data.status),
    note: checkText(data.note ?? "", "Ghi chú", 500, false),
  };
}

function cleanCategory(data) {
  const name = checkText(data.name, "Tên danh mục", 50);
  if (!Object.keys(TYPES).includes(data.type)) throw new Error("Loại danh mục phải là thu hoặc chi.");
  const budget = checkInteger(data.monthly_budget ?? 0, "Ngân sách", 0);
  return { name, type: data.type, monthly_budget: data.type === "expense" ? budget : 0 };
}

async function mustFind(store, id, label) {
  const item = await ask(store.get(id));
  if (!item) throw new Error(`Không tìm thấy ${label}.`);
  return item;
}

async function createStore(name = "so-thu-chi", withSampleData = true) {
  const db = await openDatabase(name, withSampleData);
  const read = (work) => withStores(db, "readonly", work);
  const write = (work) => withStores(db, "readwrite", work);

  // Đọc toàn bộ dữ liệu, ghép giao dịch với danh mục tương ứng
  async function loadAll() {
    const [categories, rows] = await read((c, t) => Promise.all([ask(c.getAll()), ask(t.getAll())]));
    const byId = new Map(categories.map((c) => [c.id, c]));
    const transactions = rows.map((t) => ({ ...t, category_name: byId.get(t.category_id).name, type: byId.get(t.category_id).type }));
    return { categories, transactions };
  }

  // ---------- Giao dịch ----------
  async function listTransactions(filter = {}) {
    const { transactions } = await loadAll();
    const normalize = (s) => s.normalize("NFC").toLocaleLowerCase("vi");
    const keyword = normalize((filter.q ?? "").trim());
    return transactions
      .filter((t) =>
        (!filter.month || t.date.startsWith(filter.month)) &&
        (!filter.type || t.type === filter.type) &&
        (!filter.status || t.status === filter.status) &&
        (!filter.category_id || t.category_id === Number(filter.category_id)) &&
        (!keyword || normalize(`${t.title} ${t.note}`).includes(keyword)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }

  // Có id thì sửa, không có id thì thêm mới
  function saveTransaction(data, id) {
    return write(async (categories, transactions) => {
      const item = cleanTransaction(data);
      await mustFind(categories, item.category_id, "danh mục");
      const now = new Date().toISOString();
      const old = id ? await mustFind(transactions, id, "giao dịch") : null;
      const record = { ...old, ...item, created_at: old?.created_at ?? now, updated_at: now };
      const key = await ask(transactions.put(record));
      return { ...record, id: key };
    });
  }

  function setStatus(id, status) {
    return write(async (_categories, transactions) => {
      checkStatus(status);
      const old = await mustFind(transactions, id, "giao dịch");
      await ask(transactions.put({ ...old, status, updated_at: new Date().toISOString() }));
    });
  }

  function deleteTransaction(id) {
    return write(async (_categories, transactions) => {
      await mustFind(transactions, id, "giao dịch");
      await ask(transactions.delete(id));
    });
  }

  // ---------- Danh mục ----------
  async function listCategories() {
    const { categories, transactions } = await loadAll();
    return categories
      .map((c) => ({ ...c, transaction_count: transactions.filter((t) => t.category_id === c.id).length }))
      .sort((a, b) => b.type.localeCompare(a.type) || a.id - b.id);
  }

  async function saveCategory(data, id) {
    try {
      return await write(async (categories, transactions) => {
        const item = cleanCategory(data);
        if (id) {
          const old = await mustFind(categories, id, "danh mục");
          const used = await ask(transactions.index("category_id").count(id));
          if (used && old.type !== item.type) throw new Error("Không thể đổi loại của danh mục đã có giao dịch.");
          item.id = id;
        }
        const key = await ask(categories.put(item));
        return { ...item, id: key };
      });
    } catch (error) {
      if (error?.name === "ConstraintError") throw new Error("Danh mục này đã tồn tại.");
      throw error;
    }
  }

  function deleteCategory(id) {
    return write(async (categories, transactions) => {
      await mustFind(categories, id, "danh mục");
      if (await ask(transactions.index("category_id").count(id))) {
        throw new Error("Danh mục đang có giao dịch nên không thể xóa.");
      }
      await ask(categories.delete(id));
    });
  }

  // ---------- Thống kê (chỉ tính giao dịch "Hoàn thành") ----------
  async function stats(month) {
    const { categories, transactions } = await loadAll();
    const done = transactions.filter((t) => t.status === "completed");
    const sum = (list, type) => list.filter((t) => t.type === type).reduce((total, t) => total + t.amount, 0);
    const inMonth = done.filter((t) => t.date.startsWith(month));
    const untilMonth = done.filter((t) => t.date.slice(0, 7) <= month);

    const status_counts = Object.fromEntries(Object.keys(STATUS).map((key) =>
      [key, transactions.filter((t) => t.status === key && t.date.startsWith(month)).length]));

    const by_category = categories
      .filter((c) => c.type === "expense")
      .map((c) => ({
        id: c.id, name: c.name, budget: c.monthly_budget,
        spent: sum(inMonth.filter((t) => t.category_id === c.id), "expense"),
      }))
      .sort((a, b) => b.spent - a.spent || a.id - b.id);

    const [year, number] = month.split("-").map(Number);
    const monthly = [5, 4, 3, 2, 1, 0].map((back) => {
      const key = localDate(new Date(year, number - 1 - back, 1)).slice(0, 7);
      const rows = done.filter((t) => t.date.startsWith(key));
      return { month: key, income: sum(rows, "income"), expense: sum(rows, "expense") };
    });

    const income = sum(inMonth, "income");
    const expense = sum(inMonth, "expense");
    return {
      income, expense, net: income - expense,
      balance: sum(untilMonth, "income") - sum(untilMonth, "expense"),
      status_counts, by_category, monthly,
    };
  }

  return {
    listTransactions, saveTransaction, setStatus, deleteTransaction,
    listCategories, saveCategory, deleteCategory, stats,
    close: () => db.close(),
  };
}

function toCsv(rows) {
  // Ngăn Excel hiểu nội dung người dùng nhập thành công thức
  const cell = (value) => {
    let text = String(value);
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const table = [["Ngày", "Nội dung", "Loại", "Danh mục", "Số tiền (VND)", "Trạng thái", "Ghi chú"],
    ...rows.map((t) => [t.date, t.title, TYPES[t.type], t.category_name, t.amount, STATUS[t.status], t.note])];
  return "﻿" + table.map((row) => row.map(cell).join(",")).join("\r\n"); // BOM để đọc đúng tiếng Việt
}
