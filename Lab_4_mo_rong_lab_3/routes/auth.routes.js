const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Trang đăng nhập
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

// Đăng xuất
router.get('/logout', authController.logout);

// Trang đăng ký (optional - có thể bỏ hoặc chỉ cho admin tạo user)
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);

module.exports = router;
