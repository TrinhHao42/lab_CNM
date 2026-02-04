const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const upload = require('../configs/multer');
const { requireAuth, requireAdmin, requireStaff } = require('../middlewares/auth.middleware');

// Xem danh sách (admin & staff)
router.get('/products', requireStaff, productController.getAllProducts);

// Thêm sản phẩm (chỉ admin)
router.get('/products/add', requireAdmin, productController.getAddProductPage);
router.post('/products/add', requireAdmin, upload.single('image'), productController.addProduct);

// Sửa sản phẩm (chỉ admin)
router.get('/products/edit/:id', requireAdmin, productController.getEditProductPage);
router.post('/products/edit/:id', requireAdmin, upload.single('image'), productController.updateProduct);

// Xóa sản phẩm (chỉ admin)
router.post('/products/delete/:id', requireAdmin, productController.deleteProduct);

// Xem logs (admin & staff)
router.get('/products/:id/logs', requireStaff, productController.getProductLogs);

module.exports = router;