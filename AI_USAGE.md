# AI Usage Log

## 1. Công cụ AI

- **Tên công cụ:** ChatGPT (OpenAI)

## 2. Mục đích sử dụng

- Phân tích giao diện website thương mại điện tử tham khảo.
- Đề xuất cải tiến thẻ sản phẩm để làm rõ tên, giá gốc, giá khuyến mãi và tỷ lệ giảm giá.
- Hỗ trợ xây dựng giao diện HTML5/CSS3 responsive.
- Giải thích cách chạy website và lập tài liệu mô tả dự án.

## 3. Prompt đã sử dụng

Các prompt chính đã sử dụng trong quá trình thực hiện:

1. “Bạn là chuyên gia phân tích nghiệp vụ và thiết kế trải nghiệm người dùng cho website thương mại điện tử. Tôi đang khảo sát website Con Cưng… Hãy giúp tôi lập bảng phân tích 5 khu vực: trang chủ, danh mục sản phẩm, chi tiết sản phẩm, tìm kiếm, giỏ hàng.”
2. “Tôi đang thực hiện bài tập phát triển giao diện website thương mại điện tử bằng HTML5 và CSS3… Tôi muốn cải tiến khu vực thẻ sản phẩm bằng cách làm rõ tên sản phẩm, giá gốc, giá khuyến mãi và tỷ lệ giảm giá. Trước tiên, hãy giải thích phương án thiết kế. Chưa tạo toàn bộ mã nguồn cho đến khi tôi yêu cầu.”
3. “Dựa trên phương án đã thống nhất, hãy tạo một trang giao diện thương mại điện tử bằng HTML5 và CSS3… Có tối thiểu 4 sản phẩm mẫu… CSS được tách thành file riêng… Giải thích cách chạy trang web và những phần tôi cần kiểm tra.”
4. “Tạo README.md… và nội dung AI_USAGE.md…”

## 4. Kết quả AI đề xuất

AI đề xuất giao diện dạng thẻ sản phẩm theo chiều dọc, sử dụng HTML ngữ nghĩa, CSS Grid và media queries. Giá khuyến mãi được nhấn mạnh; giá gốc được gạch ngang; phần trăm giảm giá hiển thị bằng nhãn riêng. Dự án có 4 sản phẩm minh họa, file HTML, file CSS và thư mục hình ảnh; không dùng backend hoặc thư viện ngoài.

## 5. Kiểm tra và điều chỉnh

Các điểm cần tự kiểm tra trước khi nộp:

- Mở `index.html` và xác nhận các hình ảnh trong thư mục `images/` tải đúng.
- Kiểm tra thẻ sản phẩm, tên, giá và nhãn giảm giá trên máy tính và điện thoại.
- Tính lại tỷ lệ giảm giá theo công thức `(giá gốc - giá khuyến mãi) / giá gốc × 100%`.
- Kiểm tra liên kết, trạng thái hover/focus và khả năng đọc khi tên sản phẩm dài.
- Xác nhận nút “Thêm vào giỏ” chỉ là thao tác minh họa; dự án chưa có giỏ hàng hoạt động thật vì không dùng JavaScript/backend.

Chỉ ghi nhận các mục trên là đã hoàn thành sau khi trực tiếp kiểm tra và điều chỉnh mã nguồn. Những thay đổi thực tế do người thực hiện bổ sung nên được ghi lại tại đây trước khi nộp.

## 6. Phần tôi hiểu và có thể giải thích

- **`index.html`:** cấu trúc nội dung, tiêu đề trang, khu vực sản phẩm, ảnh, tên, giá và nút thao tác.
- **`css/style.css`:** màu sắc, kiểu chữ, khoảng cách, đường viền, bố cục danh sách và quy tắc responsive.
- **CSS Grid / media queries:** bố trí nhiều thẻ sản phẩm và điều chỉnh số cột theo chiều rộng màn hình.
- **Giá và tỷ lệ giảm giá:** cần nhất quán giữa giá gốc, giá khuyến mãi và phần trăm hiển thị.
- **Giới hạn dự án:** đây là giao diện tĩnh; tìm kiếm, tài khoản và giỏ hàng không được kết nối với dịch vụ hoặc dữ liệu thực.
