const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

router.get('/products', productController.getAllProducts);

router.get('/products/add', productController.getAddProductPage);

router.post('/products/add', productController.addProduct);

router.get('/products/edit/:id', productController.getEditProductPage);

router.post('/products/edit/:id', productController.updateProduct);

router.post('/products/delete/:id', productController.deleteProduct);

module.exports = router;