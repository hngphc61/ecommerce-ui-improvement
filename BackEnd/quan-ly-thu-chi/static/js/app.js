"use strict";

const $ = (selector) => document.querySelector(selector);
const STATUS = { completed: "Hoàn thành", pending: "Chờ xử lý", cancelled: "Đã hủy" };
const TITLES = { overview: "Tổng quan", transactions: "Giao dịch", categories: "Danh mục & ngân sách" };
const money = (n) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";
// Chống XSS: mọi chuỗi do người dùng nhập đều phải đi qua esc()
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pad = (n) => String(n).padStart(2, "0");
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

let categories = [];
let transactions = [];
let editing = { transaction: null, category: null };
let latestRequest = 0;

async function api(url, method = "GET", body) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Có lỗi xảy ra.");
  return data;
}

function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2500);
}

function filterQuery() {
  return new URLSearchParams({
    month: $("#month").value,
    q: $("#f-q").value,
    type: $("#f-type").value,
    category_id: $("#f-category").value,
    status: $("#f-status").value,
  }).toString();
}

async function refresh() {
  const requestId = ++latestRequest;
  try {
    const cats = await api("/api/categories");
    const selected = $("#f-category").value;
    $("#f-category").innerHTML = '<option value="">Tất cả danh mục</option>' + categoryOptions(cats);
    $("#f-category").value = cats.some((c) => String(c.id) === selected) ? selected : "";
    const query = filterQuery();
    const [stats, rows] = await Promise.all([
      api(`/api/stats?month=${$("#month").value}`),
      api(`/api/transactions?${query}`),
    ]);
    if (requestId !== latestRequest) return; // bỏ qua kết quả cũ
    categories = cats;
    transactions = rows;
    $("#export").href = `/api/export.csv?${query}`;
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

function bindForm(kind, url, read) {
  const form = $(`#${kind}-form`);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector(".primary");
    button.disabled = true;
    try {
      const id = editing[kind];
      const saved = await api(id ? `${url}/${id}` : url, id ? "PUT" : "POST", read(Object.fromEntries(new FormData(form))));
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

async function remove(url, question) {
  if (!confirm(question)) return;
  try {
    await api(url, "DELETE");
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
  if (data.deleteTransaction) remove(`/api/transactions/${data.deleteTransaction}`, `Xóa giao dịch "${find(transactions, data.deleteTransaction).title}"?`);
  if (data.deleteCategory) remove(`/api/categories/${data.deleteCategory}`, `Xóa danh mục "${find(categories, data.deleteCategory).name}"?`);
});

$("#transaction-rows").addEventListener("change", async (event) => {
  const id = event.target.dataset.status;
  if (!id) return;
  try {
    await api(`/api/transactions/${id}/status`, "PATCH", { status: event.target.value });
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
bindForm("transaction", "/api/transactions", (d) => ({ ...d, amount: Number(d.amount), category_id: Number(d.category_id) }));
bindForm("category", "/api/categories", (d) => ({ ...d, monthly_budget: Number(d.monthly_budget) }));
["#month", "#f-type", "#f-category", "#f-status"].forEach((s) => $(s).addEventListener("change", () => {
  if (!$("#month").value) $("#month").value = today.slice(0, 7);
  refresh();
}));
$("#f-q").addEventListener("input", () => {
  clearTimeout(refresh.timer);
  refresh.timer = setTimeout(refresh, 250);
});
window.addEventListener("hashchange", showView);

$("#month").value = today.slice(0, 7);
showView();
refresh();
