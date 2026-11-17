# JavaScript Labs – Nguyễn Hồng Phúc

## Thông tin sinh viên

- Họ và tên: **Nguyễn Hồng Phúc**
- Mã số sinh viên: **31241027481**
- Lớp học phần: **26C1INF50902702**
- Học phần: Phát triển ứng dụng TMĐT
- GitHub cá nhân: https://github.com/hngphc61
- Repository: https://github.com/hngphc61/ecommerce-ui-improvement

## Mục tiêu

Thực hành JavaScript nền tảng, thao tác DOM, xử lý sự kiện và sử dụng jQuery để xây dựng các tương tác trên website. 

## Truy cập

- [Trang portfolio](./index.html)
- [Lab 08 – Language Foundations: 11 Exercise](./Lab08/index.html)
- [Lab 09 – DOM and Events: 8 Exercise](./Lab09/index.html)
- [Lab 10 – jQuery: 10 Exercise](./Lab10/index.html)

Địa chỉ truy cập portfolio trên GitHub Pages:
https://hngphc61.github.io/ecommerce-ui-improvement/JavaScript-Labs/


## Cấu trúc thư mục

```text
JavaScript-Labs/
├── index.html          # Portfolio và tổng kết kiến thức
├── README.md
├── css/style.css       # Giao diện portfolio và mục lục
├── images/anhprofile.jpg
├── Lab08/              # JavaScript nền tảng
│   ├── index.html
│   ├── Lab08.pdf
│   └── ...             # HTML, JS, CSS và tài nguyên bài thực hành
├── Lab09/              # DOM và sự kiện
│   ├── index.html
│   └── ...
└── Lab10/              # jQuery, hiệu ứng và GET request
    ├── index.html
    ├── data/cities.json
    └── ...
```

## Nội dung thực hành

| Lab | Nội dung | Ví dụ kết quả |
| --- | --- | --- |
| 08 | Biến, kiểu dữ liệu, String, Date, Math, Array, hàm, phạm vi biến, Object | Lịch 30 ngày; tổng tiền có thuế; đối tượng đơn hàng; thông tin quốc gia |
| 09 | Chọn phần tử, quan hệ DOM, tạo/xóa nút, sự kiện, load, debugger và form | Nút ẩn/hiện; ảnh xám khi rê chuột; focus/blur; thông báo trường trống |
| 10 | Bộ chọn jQuery, sự kiện, chèn DOM, fade/slide/animate, GET và jqXHR | Xem trước ảnh; chuỗi hiệu ứng; danh sách thành phố; thông báo lỗi tải dữ liệu |

## Chạy trên máy

1. Mở repository trong VS Code.
2. Dùng Live Server hoặc Live Preview để mở `JavaScript-Labs/index.html` qua HTTP.
3. Chọn Lab, sau đó chọn Exercise muốn kiểm tra.
4. Mở DevTools để xem Console, đặt breakpoint hoặc kiểm tra Network theo bài.

Không nên mở bằng `file://` đối với các bài GET request. Một số trang mẫu dùng Bootstrap và Font Awesome qua CDN nên cần Internet để tải đầy đủ giao diện.

## Các điều chỉnh so với bộ mẫu

- Exercise 8.1 có trang kiểm tra cục bộ thay thế trang gốc không truy cập được tại thời điểm thực hành.
- Lưu bản riêng cho một số Exercise phát triển từ bài trước để giảng viên kiểm tra được từng kết quả.
- Giữ tên `walkthrough` theo file thực tế dù PDF có chỗ ghi `exercise`.
- Các trang Lab10 đã làm có jQuery HTTPS và bản dự phòng cục bộ 3.1.1.
- Exercise 10.9–10.10 trên HTTPS gửi GET tới `data/cities.json` để tránh chặn mixed content. Đây là bản chụp 53 thành phố từ dịch vụ trong đề, tải ngày 17/11/2026; không tự cập nhật. Trên HTTP vẫn gọi dịch vụ gốc. Nguồn được ghi rõ trên giao diện.
- File `Lab08/exercise.html` được giữ từ bộ mẫu; không tính vào 11 Exercise được giao trong PDF Lab08.

## Báo cáo và sử dụng AI

Báo cáo nộp theo tên `31241027481_NguyenHongPhuc_JavaScript_Labs.docx`, gồm thông tin sinh viên, nội dung từng Exercise của ba Lab, ảnh chụp thực tế có chú thích và tổng kết.

Trong quá trình thực hiện bài tập, em sử dụng ChatGPT để hỗ trợ giải thích và kiểm tra mã nguồn, tìm hiểu các kiến thức liên quan đến JavaScript, DOM, Events và jQuery. Công cụ AI giúp em hiểu rõ hơn về cú pháp, nguyên lý hoạt động của các hàm, cách xử lý sự kiện và thao tác với các phần tử HTML. Bên cạnh đó, em tham khảo các gợi ý từ ChatGPT để xác định nguyên nhân và hướng khắc phục khi gặp lỗi trong quá trình lập trình. Tuy nhiên, em không phụ thuộc hoàn toàn vào kết quả do AI cung cấp mà chủ động đối chiếu với tài liệu hướng dẫn, kiểm tra mã nguồn và chạy thử các chức năng trên trình duyệt để đảm bảo đáp ứng yêu cầu của từng bài Lab. Em chịu trách nhiệm về nội dung mã nguồn, kết quả thực hiện và các minh chứng được trình bày trong bài nộp.
