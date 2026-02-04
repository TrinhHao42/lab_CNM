const crypto = require('crypto');
const categoryRepository = require('../repositories/category.repository');

class CategoryService {
    async getAllCategories() {
        return await categoryRepository.getAll();
    }

    async getCategoryById(categoryId) {
        const category = await categoryRepository.findById(categoryId);
        
        if (!category) {
            throw new Error('Không tìm thấy danh mục');
        }
        
        return category;
    }

    async createCategory(name, description = '') {
        // Validate
        if (!name || name.trim() === '') {
            throw new Error('Tên danh mục không được để trống');
        }

        const category = {
            categoryId: crypto.randomUUID(),
            name: name.trim(),
            description: description.trim()
        };

        return await categoryRepository.create(category);
    }

    async updateCategory(categoryId, name, description) {
        // Kiểm tra category tồn tại
        const existingCategory = await categoryRepository.findById(categoryId);
        
        if (!existingCategory) {
            throw new Error('Không tìm thấy danh mục');
        }

        // Validate
        if (!name || name.trim() === '') {
            throw new Error('Tên danh mục không được để trống');
        }

        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : ''
        };

        return await categoryRepository.update(categoryId, updateData);
    }

    async deleteCategory(categoryId) {
        // Kiểm tra category tồn tại
        const existingCategory = await categoryRepository.findById(categoryId);
        
        if (!existingCategory) {
            throw new Error('Không tìm thấy danh mục');
        }

        // Business rule: Khi xóa category, không xóa sản phẩm
        // Sản phẩm sẽ có categoryId nhưng category đã bị xóa
        // Controller hoặc view phải xử lý trường hợp này
        await categoryRepository.delete(categoryId);
    }
}

module.exports = new CategoryService();
