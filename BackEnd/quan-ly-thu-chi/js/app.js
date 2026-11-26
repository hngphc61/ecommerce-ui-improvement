"use strict";

const $ = (selector) => document.querySelector(selector);
const TITLES = { overview: "Tổng quan", transactions: "Giao dịch", categories: "Danh mục & ngân sách" };
const money = (n) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";
// Chống XSS: mọi chuỗi do người dùng nhập đều phải đi qua esc()
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const today = localDate();

let store;
let categories = [];
let transactions = [];
let editing = { transaction: null, category: null };
let latestRequest = 0;

function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2500);
}

function currentFilter() {
  return {
    month: $("#month").value,
    q: $("#f-q").value,
    type: $("#f-type").value,
    category_id: $("#f-category").value,
    status: $("#f-status").value,
  };
}

async function refresh() {
  const requestId = ++latestRequest;
  try {
    const cats = await store.listCategories();
    const selected = $("#f-category").value;
    $("#f-category").innerHTML = '<option value="">Tất cả danh mục</option>' + categoryOptions(cats);
    $("#f-category").value = cats.some((c) => String(c.id) === selected) ? selected : "";
    const [stats, rows] = await Promise.all([
      store.stats($("#month").value),
      store.listTransactions(currentFilter()),
    ]);
    if (requestId !== latestRequest) return; // bỏ qua kết quả cũ
    categories = cats;
    transactions = rows;
    renderStats(stats);
    renderTransactions();
    renderCategories();
  } catch (error) {
    toast(error.message);
  }
}

function categoryOptions(list) {
  return ["income", "expense"].map((type) => `<optgroup label="${type === "income" ? "Thu" : "Chi"}">${
    list.filter((c) => c.type === type).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")
  }</optgroup>`).join("");
}

function renderStats(s) {
  for (const key of ["income", "expense", "net", "balance"]) $(`#s-${key}`).textContent = money(s[key]);
  $("#status-summary").innerHTML = Object.entries(STATUS)
    .map(([key, label]) => `<span class="badge ${key}">${label}: <b>${s.status_counts[key]}</b></span>`).join("");

  const max = Math.max(1, ...s.monthly.flatMap((m) => [m.income, m.expense]));
  $("#monthly-chart").innerHTML = s.monthly.map((m) => {
    const label = `${m.month.slice(5)}/${m.month.slice(0, 4)}`;
    return `<div class="chart-col"><div class="bars">
      <div class="bar income-bg" style="height:${(m.income / max) * 100}%" title="Thu ${label}: ${money(m.income)}"></div>
      <div class="bar expense-bg" style="height:${(m.expense / max) * 100}%" title="Chi ${label}: ${money(m.expense)}"></div>
    </div>${label}</div>`;
  }).join("");

  const items = s.by_category.filter((c) => c.spent > 0 || c.budget > 0);
  const biggest = Math.max(1, ...items.map((c) => c.spent));
  $("#category-chart").innerHTML = items.map((c) => {
    const ratio = c.budget ? c.spent / c.budget : c.spent / biggest;
    const level = !c.budget ? "" : ratio > 1 ? "over" : ratio >= 0.8 ? "near" : "";
    const detail = c.budget ? `${money(c.spent)} / ${money(c.budget)}` : money(c.spent);
    const warning = level === "over" ? ` <span class="over-text">Vượt ${money(c.spent - c.budget)}</span>` : "";
    return `<div class="budget"><div class="budget-head"><span>${esc(c.name)}${warning}</span><span>${detail}</span></div>
      <div class="track"><div class="fill ${level}" style="width:${Math.min(ratio, 1) * 100}%"></div></div></div>`;
  }).join("") || '<p class="empty">Chưa có dữ liệu chi tiêu.</p>';
}

function renderTransactions() {
  $("#transaction-rows").innerHTML = transactions.map((t) => `
    <tr class="is-${t.status}">
      <td>${t.date.split("-").reverse().join("/")}</td>
      <td>${esc(t.title)}<small>${esc(t.note)}</small></td>
      <td>${esc(t.category_name)}</td>
      <td class="right money ${t.type}">${t.type === "income" ? "+" : "−"}${money(t.amount)}</td>
      <td><select class="badge ${t.status}" data-status="${t.id}" aria-label="Cập nhật trạng thái">
        ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === t.status ? "selected" : ""}>${v}</option>`).join("")}
      </select></td>
      <td class="right"><button class="btn small" data-edit-transaction="${t.id}">Sửa</button><button class="btn small danger" data-delete-transaction="${t.id}">Xóa</button></td>
    </tr>`).join("") || '<tr><td colspan="6" class="empty">Không có giao dịch phù hợp.</td></tr>';
}

function renderCategories() {
  $("#category-rows").innerHTML = categories.map((c) => `
    <tr>
      <td>${esc(c.name)}</td>
      <td class="${c.type}">${c.type === "income" ? "Thu" : "Chi"}</td>
      <td class="right">${!c.monthly_budget ? "—" : money(c.monthly_budget)}</td>
      <td class="right">${c.transaction_count}</td>
      <td class="right"><button class="btn small" data-edit-category="${c.id}">Sửa</button><button class="btn small danger" data-delete-category="${c.id}">Xóa</button></td>
    </tr>`).join("");
}

function openTransaction(item) {
  if (!categories.length) return toast("Hãy tạo danh mục trước.");
  const form = $("#transaction-form");
  form.reset();
  editing.transaction = item?.id ?? null;
  form.category_id.innerHTML = categoryOptions(categories);
  $("#transaction-title").textContent = item ? "Sửa giao dịch" : "Thêm giao dịch";
  // Mặc định: hôm nay, hoặc ngày đầu của tháng đang xem
  const month = $("#month").value;
  form.date.value = today.startsWith(month) ? today : `${month}-01`;
  if (item) for (const key of ["title", "amount", "date", "category_id", "status", "note"]) form.elements[key].value = item[key];
  form.querySelector(".error").textContent = "";
  $("#transaction-dialog").showModal();
}

function openCategory(item) {
  const form = $("#category-form");
  form.reset();
  editing.category = item?.id ?? null;
  $("#category-title").textContent = item ? "Sửa danh mục" : "Thêm danh mục";
  if (item) for (const key of ["name", "type", "monthly_budget"]) form.elements[key].value = item[key];
  form.querySelector(".error").textContent = "";
  $("#category-dialog").showModal();
}

function bindForm(kind, save, read) {
  const form = $(`#${kind}-form`);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector(".primary");
    button.disabled = true;
    try {
      const id = editing[kind];
      const saved = await save(read(Object.fromEntries(new FormData(form))), id);
      $(`#${kind}-dialog`).close();
      // Chuyển tới tháng của giao dịch vừa lưu để người dùng nhìn thấy nó
      if (saved.date) $("#month").value = saved.date.slice(0, 7);
      toast("Đã lưu.");
      await refresh();
    } catch (error) {
      form.querySelector(".error").textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
}

async function remove(action, question) {
  if (!confirm(question)) return;
  try {
    await action();
    toast("Đã xóa.");
    await refresh();
  } catch (error) {
    toast(error.message);
  }
}

document.addEventListener("click", (event) => {
  const el = event.target.closest("button");
  if (!el) return;
  const data = el.dataset;
  const find = (list, id) => list.find((x) => x.id === Number(id));
  if ("close" in data) el.closest("dialog").close();
  if (data.editTransaction) openTransaction(find(transactions, data.editTransaction));
  if (data.editCategory) openCategory(find(categories, data.editCategory));
  if (data.deleteTransaction) remove(() => store.deleteTransaction(Number(data.deleteTransaction)), `Xóa giao dịch "${find(transactions, data.deleteTransaction).title}"?`);
  if (data.deleteCategory) remove(() => store.deleteCategory(Number(data.deleteCategory)), `Xóa danh mục "${find(categories, data.deleteCategory).name}"?`);
});

$("#transaction-rows").addEventListener("change", async (event) => {
  const id = event.target.dataset.status;
  if (!id) return;
  try {
    await store.setStatus(Number(id), event.target.value);
    toast("Đã cập nhật trạng thái.");
  } catch (error) {
    toast(error.message);
  }
  await refresh();
});

function showView() {
  const view = TITLES[location.hash.slice(1)] ? location.hash.slice(1) : "overview";
  document.querySelectorAll(".view").forEach((el) => (el.hidden = el.id !== `view-${view}`));
  document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("active", a.dataset.view === view));
  $("#page-title").textContent = TITLES[view];
}

$("#add-transaction").addEventListener("click", () => openTransaction());
$("#add-category").addEventListener("click", () => openCategory());
bindForm("transaction", (d, id) => store.saveTransaction(d, id), (d) => ({ ...d, amount: Number(d.amount), category_id: Number(d.category_id) }));
bindForm("category", (d, id) => store.saveCategory(d, id), (d) => ({ ...d, monthly_budget: Number(d.monthly_budget) }));
["#month", "#f-type", "#f-category", "#f-status"].forEach((s) => $(s).addEventListener("change", () => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test($("#month").value)) $("#month").value = today.slice(0, 7);
  refresh();
}));
$("#f-q").addEventListener("input", () => {
  clearTimeout(refresh.timer);
  refresh.timer = setTimeout(refresh, 250);
});
$("#export").addEventListener("click", async () => {
  try {
    const rows = await store.listTransactions(currentFilter());
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    link.download = `thu-chi-${$("#month").value}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (error) {
    toast(error.message);
  }
});
window.addEventListener("hashchange", showView);

$("#month").value = today.slice(0, 7);
showView();
createStore()
  .then((opened) => {
    store = opened;
    return refresh();
  })
  .catch(() => toast("Không mở được database. Hãy dùng Chrome hoặc Edge, không dùng chế độ ẩn danh."));
