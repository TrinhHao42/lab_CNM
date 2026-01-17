-- Tạo bảng users nếu chưa có
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Thêm user mặc định (chỉ chạy 1 lần)
INSERT IGNORE INTO users (username, password) VALUES ('admin', '123456');

-- Kiểm tra bảng products đã tồn tại
-- CREATE TABLE IF NOT EXISTS products (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   name VARCHAR(100) NOT NULL,
--   price DECIMAL(10,2),
--   quantity INT
-- );
