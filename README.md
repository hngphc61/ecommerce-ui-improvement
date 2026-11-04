# E-commerce UI Improvement

## 1. Giới thiệu

Đây là giao diện mẫu website thương mại điện tử dành cho nhóm sản phẩm mẹ và bé, xây dựng bằng HTML5 và CSS3. Khu vực được cải tiến trọng tâm là thẻ sản phẩm: tên sản phẩm, giá khuyến mãi, giá gốc và tỷ lệ giảm giá được phân cấp thị giác rõ ràng hơn.

## 2. Website tham khảo

- **Tên website:** Con Cưng
- **URL:** https://concung.com/
- **Khu vực đã khảo sát:** Trang chủ, danh sách/danh mục sản phẩm và thẻ sản phẩm.

> Đây là bài tập giao diện tham khảo, không phải website chính thức của Con Cưng. Nội dung và giá sản phẩm trong dự án chỉ mang tính minh họa.

## 3. Chức năng

- Hiển thị danh sách gồm 4 sản phẩm mẫu.
- Hiển thị hình ảnh, tên sản phẩm, giá gốc, giá khuyến mãi và nhãn phần trăm giảm giá.
- Có nút thao tác “Thêm vào giỏ” ở mỗi thẻ sản phẩm.
- Bố cục tự điều chỉnh theo kích thước màn hình máy tính và điện thoại.
- Có khu vực tiêu đề, tìm kiếm và điều hướng minh họa.

## 4. Công nghệ

- HTML5
- CSS3

## 5. Cách chạy

1. Giải nén thư mục dự án.
2. Giữ nguyên `index.html`, `css/style.css` và thư mục `images/` cùng cấp.
3. Mở file `index.html` bằng trình duyệt web (Chrome, Edge, Firefox hoặc trình duyệt tương thích).

Không cần backend, cơ sở dữ liệu, bước build hoặc cài thư viện bổ sung.

## 6. Cải tiến đã thực hiện

Vấn đề ban đầu cần giải quyết là thông tin giá trong thẻ sản phẩm có thể chưa đủ nổi bật hoặc khó so sánh nhanh. Giao diện mẫu sắp xếp tên sản phẩm riêng biệt, làm nổi bật giá khuyến mãi, gạch ngang giá gốc và dùng nhãn phần trăm giảm giá. Màu sắc, khoảng cách và bố cục thẻ được tổ chức nhất quán; CSS responsive giúp danh sách thích nghi với màn hình nhỏ.

## 7. Hỗ trợ từ AI

AI hỗ trợ phân tích yêu cầu, đề xuất thứ bậc thông tin và bố cục thẻ sản phẩm, gợi ý cấu trúc HTML5/CSS3, responsive và nội dung tài liệu dự án. Người thực hiện cần tự chạy website, kiểm tra hiển thị trên các kích thước màn hình, đối chiếu phép tính giảm giá và điều chỉnh nội dung hoặc mã nguồn theo yêu cầu bài tập trước khi nộp.
## Buổi 2: Thực hành HTML5 và CSS3

### 1. Phạm vi thực hiện

Bài tập tiếp tục phát triển giao diện cửa hàng mẹ và bé Con Cưng
từ Buổi 1. Khu vực cải thiện chính là “Sản phẩm nổi bật”, gồm
bốn thẻ sản phẩm. Ngoài ra, em điều chỉnh font chữ và khoảng
cách chữ của logo sau khi kiểm tra giao diện.

### 2. Những nội dung đã thực hiện

- Rà soát cấu trúc HTML5 và thứ bậc tiêu đề.
- Giữ các phần tử `section`, `article`, `h2`, `h3` phù hợp với nội dung.
- Thay `span` chứa giá gốc bằng `s`.
- Bỏ liên kết ở ảnh và tên sản phẩm khi chưa có trang chi tiết.
- Giữ các liên kết nội trang có đích hợp lệ.
- Tiếp tục sử dụng tệp CSS riêng tại `css/style.css`.
- Bổ sung quy tắc chung giới hạn kích thước hình ảnh.
- Thực hành element selector, class selector và descendant selector.
- Điều chỉnh padding, margin, border và border-radius của thẻ sản phẩm.
- Dùng Flexbox để căn chỉnh tiêu đề và liên kết “Xem tất cả”.
- Thử CSS Grid hai cột, ba cột và chọn bốn cột cho giao diện cuối.
- Bổ sung hiệu ứng hover, active và focus-visible cho nút.
- Đổi font chung sang Segoe UI và đặt khoảng cách chữ của logo về normal.

### 3. Bố cục cuối cùng

| Chiều rộng màn hình | Số cột sản phẩm |
|---|---:|
| Trên 900px | 4 |
| Từ 900px trở xuống | 2 |

Ảnh sản phẩm sử dụng `object-fit: contain` để giữ tỷ lệ và
hiển thị toàn bộ ảnh trong khung.

### 4. Hướng dẫn chạy

1. Tải hoặc clone repository về máy.
2. Giữ nguyên cấu trúc thư mục `css` và `images`.
3. Mở `index.html` bằng trình duyệt hoặc Live Preview trong VS Code.

Website là giao diện minh họa. Nút “Thêm vào giỏ” hiển thị
thông báo, chưa kết nối hệ thống bán hàng. Thanh tìm kiếm
chưa có chức năng lọc sản phẩm.

### 5. Báo cáo kiểm thử

Em kiểm tra giao diện ở các chiều rộng 1366px, 768px và 390px,
đồng thời kiểm tra tương tác bằng chuột và bàn phím.

| Nội dung kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| Trang HTML mở được | Đạt | Hiển thị trong Live Preview |
| CSS được áp dụng | Đạt | Màu sắc, font và bố cục được hiển thị |
| Hình ảnh sản phẩm hiển thị đúng | Đạt | Có đủ bốn ảnh, không méo |
| Liên kết nội trang hoạt động | Đạt | “Khám phá ngay” dẫn đến khu vực sản phẩm |
| Bố cục không bị tràn nghiêm trọng | Đạt | Kiểm tra ở 1366px, 768px và 390px |
| Hover hoạt động | Đạt | Nút đổi màu, dịch chuyển nhẹ và có bóng |
| Focus-visible hoạt động | Đạt | Có đường viền khi dùng Tab đến nút |
| Nút “Thêm vào giỏ” hoạt động theo phạm vi minh họa | Đạt | Hiển thị thông báo |
| Đã tự thực hiện điều chỉnh | Đạt | Điều chỉnh font và khoảng cách chữ của logo |

#### Vấn đề phát hiện và cách sửa

Khi kiểm tra, em nhận thấy chữ trong logo “ConCưng” quá đậm
và sát nhau, khiến phần móc của chữ “ư” khó phân biệt.

Em thử các mức đậm 700 và 750, sau đó chọn phương án dùng
Segoe UI, giữ độ đậm 800 và bỏ khoảng cách chữ âm.

| Thuộc tính | Trước chỉnh sửa | Sau chỉnh sửa |
|---|---|---|
| Font chung | Arial, Helvetica, sans-serif | Segoe UI, Arial, Helvetica, sans-serif |
| Độ đậm logo | 800 | Giữ 800 |
| Khoảng cách chữ logo | -1.2px | normal |

Trong `body`:

```css
font-family: "Segoe UI", Arial, Helvetica, sans-serif;
```

Trong `.brand`:

```css
font-weight: 800;
letter-spacing: normal;
```

Sau khi xem lại, em thấy logo dễ đọc hơn và giữ phương án này.
Font hiển thị thực tế phụ thuộc vào các font có trên thiết bị.

### 6. Báo cáo sử dụng AI

#### Công cụ và mục đích

Em sử dụng ChatGPT để hỗ trợ phân tích mã nguồn, giải thích
HTML/CSS, đề xuất chỉnh sửa và hướng dẫn kiểm tra giao diện.

#### Prompt tiêu biểu và cách sử dụng kết quả

| Prompt/yêu cầu tiêu biểu | Kết quả hỗ trợ | Cách em kiểm tra hoặc điều chỉnh |
|---|---|---|
| Phân tích HTML/CSS hiện tại, chỉ ra ba vấn đề và đề xuất thứ tự cải thiện; chưa viết lại website | Nhận xét cấu trúc và xác định vấn đề | Đối chiếu với mã nguồn hiện có |
| Hướng dẫn CSS selector và Box Model | Điều chỉnh khoảng cách, viền, tên, giá và nút | So sánh giao diện trước và sau |
| Hướng dẫn thực hành Flexbox | Giải thích justify-content, align-items và gap | Thử các cách căn chỉnh trên trình duyệt |
| Hướng dẫn bố cục sản phẩm bằng CSS Grid | Thử danh sách hai và ba cột | Chọn lại bốn cột cho giao diện cuối |
| Hướng dẫn hover và focus-visible | Bổ sung phản hồi cho nút | Kiểm tra bằng chuột và phím Tab |
| Hỗ trợ điều chỉnh chữ trong logo | Đề xuất thay đổi độ đậm và khoảng cách chữ | Thử nhiều phương án, chọn Segoe UI và giữ độ đậm 800 |

#### Những đề xuất đã điều chỉnh

- AI từng đề xuất liên kết ảnh đến phần thông tin ngay dưới sản phẩm.
  Sau khi thử, em thấy cách này ít hữu ích nên bỏ liên kết.
- Em thử Grid hai và ba cột, sau đó chọn lại bốn cột trên màn hình rộng.
- Em so sánh các mức đậm của logo và đổi font trước khi chọn phương án cuối.

Em kiểm tra các thay đổi trên trình duyệt và giữ lại những
đề xuất phù hợp với nội dung, phạm vi bài tập.
