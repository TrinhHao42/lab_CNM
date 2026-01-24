const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const upload = require('../configs/multer');

router.get('/products', productController.getAllProducts);

router.get('/products/add', productController.getAddProductPage);

router.post('/products/add', upload.single('image'), productController.addProduct);

router.get('/products/edit/:id', productController.getEditProductPage);

router.post('/products/edit/:id', productController.updateProduct);

router.post('/products/delete/:id', productController.deleteProduct);

router.get('/products/image', productController.getImageFromS3);

module.exports = router;