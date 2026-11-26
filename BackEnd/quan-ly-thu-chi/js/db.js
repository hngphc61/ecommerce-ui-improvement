"use strict";
// Lớp truy cập database IndexedDB của trình duyệt.

const SAMPLE_CATEGORIES = [
  // [tên, loại, ngân sách tháng]
  ["Lương làm thêm", "income", 0],
  ["Gia đình gửi", "income", 0],
  ["Học bổng", "income", 0],
  ["Ăn uống", "expense", 2500000],
  ["Nhà trọ", "expense", 2200000],
  ["Đi lại", "expense", 500000],
  ["Học tập", "expense", 800000],
  ["Giải trí", "expense", 600000],
  ["Mua sắm", "expense", 700000],
];

// [nội dung, tên danh mục, số tiền, ngày trong tháng]
const SAMPLE_MONTHLY = [
  ["Gia đình gửi hằng tháng", "Gia đình gửi", 4000000, 1],
  ["Lương part-time", "Lương làm thêm", 3200000, 5],
  ["Tiền trọ và điện nước", "Nhà trọ", 2050000, 3],
  ["Đi chợ đầu tháng", "Ăn uống", 650000, 2],
  ["Cơm trưa tại trường", "Ăn uống", 480000, 9],
  ["Ăn tối cùng bạn", "Ăn uống", 280000, 16],
  ["Đi chợ giữa tháng", "Ăn uống", 560000, 19],
  ["Đổ xăng", "Đi lại", 200000, 7],
  ["Gửi xe tháng", "Đi lại", 120000, 4],
  ["Mua giáo trình, in tài liệu", "Học tập", 390000, 11],
  ["Xem phim cuối tuần", "Giải trí", 210000, 14],
  ["Cà phê học nhóm", "Giải trí", 150000, 22],
  ["Mua đồ dùng cá nhân", "Mua sắm", 450000, 18],
];

function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Nạp dữ liệu mẫu 6 tháng gần nhất (chỉ chạy khi database được tạo lần đầu)
function seed(categoryStore, transactionStore) {
  const ids = {};
  SAMPLE_CATEGORIES.forEach(([name, type, monthly_budget], index) => {
    ids[name] = index + 1;
    categoryStore.add({ id: index + 1, name, type, monthly_budget });
  });

  const now = new Date();
  const today = localDate(now);
  const stamp = now.toISOString();
  const add = (title, category, amount, date, status, note = "") =>
    transactionStore.add({ title, amount, category_id: ids[category], date, status, note, created_at: stamp, updated_at: stamp });

  for (let back = 5; back >= 0; back--) {
    SAMPLE_MONTHLY.forEach(([title, category, amount, day], index) => {
      const date = localDate(new Date(now.getFullYear(), now.getMonth() - back, day));
      // Thay đổi số tiền giữa các tháng để biểu đồ sinh động
      const change = (((back * 7 + index * 3) % 5) - 2) * 20000;
      const fixed = category === "Gia đình gửi";
      add(title, category, amount + (fixed ? 0 : change), date, date <= today ? "completed" : "pending");
    });
  }
  add("Học bổng khuyến khích học tập", "Học bổng", 3000000, today, "pending", "Chờ nhà trường chuyển khoản");
  add("Đặt vé xem ca nhạc", "Giải trí", 450000, today, "cancelled", "Đã hủy vé");
}

function openDatabase(name, withSampleData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const categories = db.createObjectStore("categories", { keyPath: "id", autoIncrement: true });
      categories.createIndex("name_type", ["name", "type"], { unique: true });
      const transactions = db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      transactions.createIndex("date", "date");
      transactions.createIndex("category_id", "category_id");
      if (withSampleData) seed(categories, transactions);
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

// Đổi một IDBRequest thành Promise
const ask = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// Chạy một giao dịch database: hoặc thành công toàn bộ, hoặc hủy toàn bộ
async function withStores(db, mode, work) {
  const tx = db.transaction(["categories", "transactions"], mode);
  const done = new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error);
  });
  done.catch(() => {});
  let result;
  try {
    result = await work(tx.objectStore("categories"), tx.objectStore("transactions"));
  } catch (error) {
    try { tx.abort(); } catch { /* giao dịch đã kết thúc */ }
    throw error;
  }
  await done;
  return result;
}
