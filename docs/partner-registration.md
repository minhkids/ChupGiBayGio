# Đăng ký đối tác

Dự án hiện dùng Vite/React và Hono Worker, không dùng Next.js. Các trang `/join/film-lab` và `/join/photographer` là route SPA; API đăng ký chạy trong `src/workers/partnerRoutes.ts`.

Trước khi deploy Worker phiên bản này, áp migration `0007_partner_registration.sql` vào D1 production bằng `npm run cf:d1:migrate` (script đã kèm `--remote --env production`). Sau đó deploy Worker và Pages theo workflow hiện có. Không dùng lệnh migration local để cập nhật production. Chưa áp migration thì API đọc/lưu đối tác sẽ lỗi.

Thông tin hợp lệ được công khai ngay (`status = published`) trong danh sách Dịch vụ; shop bán film cũng xuất hiện trên bản đồ và danh sách cửa hàng gần tôi với tọa độ geocode từ Nominatim. Route cũ `/join/film-lab` được giữ để các link đã chia sẻ còn hoạt động, nhưng biểu mẫu chỉ dành cho shop bán film; backend luôn lưu `fast_2h = 0`, kể cả khi client tự gửi trường này. Bảng D1 `film_labs` và API `register-lab` giữ nguyên tên để tương thích dữ liệu hiện có. Biểu mẫu giới hạn ảnh: shop 0–1, nhiếp ảnh gia 3–6 JPG/PNG/WebP, tối đa 3 MB/ảnh. Ảnh lưu R2 và phục vụ qua `/api/partner/images/partner/...`; không cần cấu hình public R2 URL. KV giới hạn một lần đăng ký thành công/IP/loại trong 24 giờ và cache tọa độ 30 ngày. Nominatim có giới hạn sử dụng; nếu lưu lượng tăng cần dịch vụ geocoding có SLA, rate limiting tập trung và chống spam mạnh hơn. Tọa độ tự động có thể chưa trúng cửa tiệm; đối tác nên kiểm tra ghim sau khi đăng.

Link thành công `https://chupgibaygio.com/?services=film|photographers&partner=<uuid>` mở Tab Dịch vụ và thẻ tương ứng. Admin quản lý bản ghi mới trong `/admin/labs` và `/admin/photographers` như các mục CMS khác. Không cần mật khẩu admin để đăng ký, nhưng trang admin vẫn yêu cầu phiên đăng nhập.
