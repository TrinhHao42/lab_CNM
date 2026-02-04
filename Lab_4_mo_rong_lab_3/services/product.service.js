const crypto = require('crypto');
const productRepository = require('../repositories/product.repository');
const productLogRepository = require('../repositories/productLog.repository');
const { uploadToS3, deleteFromS3 } = require('../configs/s3Helper');

class ProductService {
    async getAllProducts() {
        return await productRepository.getAll(false); // Không lấy sản phẩm đã xóa
    }

    async getProductById(id) {
        const product = await productRepository.findById(id);
        
        if (!product || product.isDeleted) {
            throw new Error('Không tìm thấy sản phẩm');
        }
        
        return product;
    }

    async searchAndFilter(filters) {
        return await productRepository.searchAndFilter(filters);
    }

    async createProduct(productData, file, userId) {
        // Validate
        if (!productData.name || productData.name.trim() === '') {
            throw new Error('Tên sản phẩm không được để trống');
        }

        if (!productData.price || productData.price <= 0) {
            throw new Error('Giá sản phẩm phải lớn hơn 0');
        }

        if (productData.quantity === undefined || productData.quantity < 0) {
            throw new Error('Số lượng sản phẩm không hợp lệ');
        }

        // Upload ảnh nếu có
        let imageUrl = '';
        if (file) {
            imageUrl = await uploadToS3(file);
        }

        // Tạo sản phẩm
        const product = {
            id: crypto.randomUUID(),
            name: productData.name.trim(),
            price: parseFloat(productData.price),
            quantity: parseInt(productData.quantity),
            categoryId: productData.categoryId || null,
            url_image: imageUrl,
            isDeleted: false,
            createdAt: new Date().toISOString()
        };

        const createdProduct = await productRepository.create(product);

        // Ghi log
        await this.logAction('CREATE', product.id, userId);

        return createdProduct;
    }

    async updateProduct(id, productData, file, userId) {
        // Kiểm tra sản phẩm tồn tại
        const existingProduct = await productRepository.findById(id);
        
        if (!existingProduct || existingProduct.isDeleted) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Validate
        if (productData.name && productData.name.trim() === '') {
            throw new Error('Tên sản phẩm không được để trống');
        }

        if (productData.price !== undefined && productData.price <= 0) {
            throw new Error('Giá sản phẩm phải lớn hơn 0');
        }

        if (productData.quantity !== undefined && productData.quantity < 0) {
            throw new Error('Số lượng sản phẩm không hợp lệ');
        }

        // Upload ảnh mới nếu có
        let imageUrl = existingProduct.url_image;
        if (file) {
            // Xóa ảnh cũ nếu có
            if (existingProduct.url_image) {
                try {
                    await deleteFromS3(existingProduct.url_image);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
            imageUrl = await uploadToS3(file);
        }

        // Cập nhật sản phẩm
        const updateData = {
            name: productData.name ? productData.name.trim() : existingProduct.name,
            price: productData.price !== undefined ? parseFloat(productData.price) : existingProduct.price,
            quantity: productData.quantity !== undefined ? parseInt(productData.quantity) : existingProduct.quantity,
            categoryId: productData.categoryId !== undefined ? productData.categoryId : existingProduct.categoryId,
            url_image: imageUrl
        };

        const updatedProduct = await productRepository.update(id, updateData);

        // Ghi log
        await this.logAction('UPDATE', id, userId);

        return updatedProduct;
    }

    async deleteProduct(id, userId) {
        // Kiểm tra sản phẩm tồn tại
        const existingProduct = await productRepository.findById(id);
        
        if (!existingProduct || existingProduct.isDeleted) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Soft delete
        await productRepository.softDelete(id);

        // Ghi log
        await this.logAction('DELETE', id, userId);

        // Không xóa ảnh trên S3 để có thể khôi phục nếu cần
    }

    // Inventory status
    getInventoryStatus(quantity) {
        if (quantity === 0) {
            return { status: 'out_of_stock', label: 'Hết hàng', class: 'danger' };
        } else if (quantity < 5) {
            return { status: 'low_stock', label: 'Sắp hết', class: 'warning' };
        } else {
            return { status: 'in_stock', label: 'Còn hàng', class: 'success' };
        }
    }

    // Log action
    async logAction(action, productId, userId) {
        const log = {
            logId: crypto.randomUUID(),
            productId,
            action,
            userId: userId || 'system',
            time: new Date().toISOString()
        };

        await productLogRepository.create(log);
    }

    async getProductLogs(productId) {
        return await productLogRepository.getByProductId(productId);
    }

    async getAllLogs(limit = 50) {
        return await productLogRepository.getAll(limit);
    }
}

module.exports = new ProductService();
