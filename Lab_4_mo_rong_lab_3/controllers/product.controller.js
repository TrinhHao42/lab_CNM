const productService = require('../services/product.service');
const categoryService = require('../services/category.service');

exports.getAllProducts = async (req, res) => {
    try {
        // Lấy các tham số tìm kiếm/lọc từ query
        const { categoryId, minPrice, maxPrice, searchName, page = 1 } = req.query;
        
        const limit = 3; // Phân trang 3 sản phẩm mỗi trang
        const currentPage = parseInt(page);
        
        // Lấy tất cả sản phẩm (có thể filter)
        let allProducts;
        
        if (categoryId || minPrice || maxPrice || searchName) {
            const filters = {
                categoryId,
                minPrice,
                maxPrice,
                searchName
            };
            const result = await productService.searchAndFilter(filters);
            allProducts = result.items;
        } else {
            allProducts = await productService.getAllProducts();
        }

        // Thêm thông tin inventory status
        allProducts.forEach(product => {
            product.inventoryStatus = productService.getInventoryStatus(product.quantity);
        });

        // Tính toán phân trang
        const totalProducts = allProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const products = allProducts.slice(startIndex, endIndex);

        // Lấy danh sách categories
        const categories = await categoryService.getAllCategories();

        res.render('products', { 
            products, 
            categories,
            filters: { categoryId, minPrice, maxPrice, searchName },
            pagination: {
                currentPage,
                totalPages,
                totalProducts,
                limit
            },
            user: req.session.user 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load products');
    }
};

exports.getAddProductPage = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.render('add-product', { categories, user: req.session.user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load page');
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, quantity, categoryId } = req.body;
        const userId = req.session.user ? req.session.user.userId : null;

        await productService.createProduct(
            { name, price, quantity, categoryId },
            req.file,
            userId
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};

exports.getEditProductPage = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        const categories = await categoryService.getAllCategories();
        
        res.render('edit-product', { 
            product, 
            categories,
            user: req.session.user 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send(error.message);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, categoryId } = req.body;
        const userId = req.session.user ? req.session.user.userId : null;

        await productService.updateProduct(
            id,
            { name, price, quantity, categoryId },
            req.file,
            userId
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.user ? req.session.user.userId : null;

        await productService.deleteProduct(id, userId);

        res.redirect('/products');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};

// Xem logs của một sản phẩm
exports.getProductLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        const logs = await productService.getProductLogs(id);
        
        res.render('product-logs', { 
            product, 
            logs,
            user: req.session.user 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load logs');
    }
};
