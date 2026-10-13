# Student Manager / Quản lý sinh viên

Ứng dụng React Native đa nền tảng để quản lý hồ sơ sinh viên.

## Chức năng

- Xem, tìm kiếm, thêm, xem chi tiết, chỉnh sửa và xóa sinh viên.
- Hồ sơ gồm họ tên, mã số sinh viên, email và ảnh đại diện (đường dẫn hoặc ảnh chọn từ thiết bị).
- Dữ liệu được lưu cục bộ bằng AsyncStorage; ảnh chọn trên iOS/Android được sao chép vào thư mục tài liệu của ứng dụng.
- Tự động hiển thị tiếng Việt hoặc tiếng Anh theo ngôn ngữ ưu tiên của thiết bị.
- Sửa và xóa đều yêu cầu xác nhận trước khi lưu thay đổi.

## Chạy ứng dụng

```bash
npm install
npx expo start
```

- Android/iOS: mở ứng dụng trong Expo Go hoặc development build.
- Web: chạy `npx expo start --web`.
