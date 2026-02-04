const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

// Tất cả routes đều yêu cầu admin
router.get('/categories', requireAdmin, categoryController.getAllCategories);
router.get('/categories/add', requireAdmin, categoryController.getAddCategoryPage);
router.post('/categories/add', requireAdmin, categoryController.addCategory);
router.get('/categories/edit/:id', requireAdmin, categoryController.getEditCategoryPage);
router.post('/categories/edit/:id', requireAdmin, categoryController.updateCategory);
router.post('/categories/delete/:id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
