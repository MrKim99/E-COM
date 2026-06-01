# 🛒 Hệ Thống Bán Hàng E-Commerce MVP (Chuẩn Hoá Y Tế)
Ứng dụng Web bán hàng (E-commerce MVP) toàn diện, đầy đủ chức năng dã được tối ưu hoá và cấu hình chuẩn để đẩy lên GitHub và deploy trực tiếp lên Vercel. 

Hệ thống sử dụng **Supabase** (PostgreSQL Database + Auth) để lưu trữ thực tế, và **Resend.com** để gửi email thông báo đơn đặt hàng hoả tốc về hòm thư của người bán.

---

## 🛠️ Biến Môi Trường Cần Cấu Hình Trên Vercel / Cloud Engine

Để hệ thống hoạt động thực tế với tài khoản của bạn, hãy cung cấp các biến môi trường sau trong phần thiết lập dự án trên Vercel:

| Biến Môi Trường | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL dự án kết nối đến Supabase | `https://xxyy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Khóa công khai Anon của Supabase | `eyJhbGciOiJIUzI1NiI...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa Service Role có quyền ghi Admin | `eyJhbGciOiJIUzI1NiI...` |
| `RESEND_API_KEY` | Mã thông báo API gửi Email từ Resend | `re_AaBbCc123...` |
| `SELLER_EMAIL` | Email của bạn để nhận thông báo đơn hàng hoả tốc | `achau.kimduc@gmail.com` |
| `ADMIN_PASSWORD` | Mật khẩu Admin đăng nhập trang quản trị (Mặc định: `admin123`) | `admin123` |

---

## 🗃️ Cấu Trúc Dự Án (Folder Tree Structure)

Hệ thống được tổ chức chuẩn hóa, dạng Mô-đun dễ bảo trì:
```text
├── index.html                  # Khung hiển thị HTML SPA chính
├── package.json                # Quản lý thư viện cài đặt & Các câu lệnh phát triển
├── server.ts                   # Máy chủ Backend Custom Express tích hợp Vite & API quản lý đơn
├── supabase_schema.sql         # Query thiết lập Cơ sở dữ liệu và bảo mật RLS Supabase
├── .env.example                # File tài liệu hướng dẫn biến môi trường mẫu
├── src/
│   ├── main.tsx                # Điểm khởi chạy React của ứng dụng
│   ├── types.ts                # Khởi tạo kiểu dữ liệu cốt lõi (TypeScript interfaces)
│   ├── index.css               # Phong cách giao diện Tailwind CSS chung & Hoạt ảnh
│   ├── App.tsx                 # Điều hướng chính (Hash routing) & Trình điều khiển luồng ứng dụng
│   └── components/             # Thư mục chứa các mô-đun thành phần độc lập
│       ├── Header.tsx          # Thanh Tiêu đề & Cảnh báo Kết nối & Giỏ hàng
│       ├── ProductCard.tsx     # Thẻ Hiển thị Sản phẩm & Giá bán & nhãn giảm giá
│       ├── FilterSection.tsx   # Bộ lọc nâng cao & Tìm kiếm phân loại
│       ├── AdminProductManager.tsx # Giao diện Thêm mới, Sửa, Xoá sản phẩm
│       └── AdminOrderList.tsx  # Bản ghi đơn hàng nhận từ khách, SĐT gọi điện trực tuyến
```

---

## ⚡ Các Bước Thiết Lập Hoạt Động (Supabase Setup Guide)

### Bước 1: Khởi Tạo Database Trong Supabase
Vào trang quản trị [Supabase Dashboard](https://supabase.com), chọn phần **SQL Editor** trong dự án của bạn và dán toàn bộ đoạn mã trong file [**`supabase_schema.sql`**](./supabase_schema.sql) để tạo bảng:
- Bảng `products`: Quản lý kho sản phẩm.
- Bảng `orders`: Ghi nhận thông tin khách hàng đặt đơn.
- Bảng `order_items`: Ghi nhận danh mục cụ thể khách hàng chọn mua.
- Bật bảo mật **Row Level Security (RLS)** để người dùng bình thường chỉ có quyền đọc sản phẩm và thêm đơn hàng mà không có quyền thay đổi trái phép.

### Bước 2: Thiết lập Resend.com
1. Đăng ký tài khoản miễn phí tại [Resend.com](https://resend.com).
2. Lấy API Key và điền vào biến `RESEND_API_KEY`.
3. Điền email của bạn vào `SELLER_EMAIL` để nhận tin nhắn HTML lập tức khi có khách đặt hàng.

---

## 🚀 Tính Năng Nổi Bật Đã Tích Hợp

1. **Dual Fallback Mode (Hoạt động hoàn cảnh)**: Khi ứng dụng chưa được điền biến môi trường Supabase/Resend, hệ thống tự động kích hoạt chế độ **Memory Fallback Mode** giúp giao diện demo, thao tác thêm bớt sản phẩm, đặt đơn hàng, phản hồi email và trang dashboard quản lý vẫn chạy mượt mà ngay trên iFrame xem trước của AI Studio để nhà đầu tư duyệt giao diện lập tức.
2. **Advanced Searching / Sorting**: Tìm kiếm theo ký tự, bộ lọc nhanh theo Danh mục y tế chuyên dụng, sắp xếp giá hay trạng thái Hot Deal.
3. **HTML Email**: Hệ thống Resend tạo mã HTML chứa thông tin khách hàng rất chi tiết, có liên kết `tel:xx` nhấp gọi điện tư vấn ngay cho người mua trên di động.
