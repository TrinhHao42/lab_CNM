const categoryService = require('../services/category.service');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.render('categories', { categories, user: req.session.user });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to load categories');
    }
};

exports.getAddCategoryPage = (req, res) => {
    res.render('add-category', { user: req.session.user });
};

exports.addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        await categoryService.createCategory(name, description);
        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};

exports.getEditCategoryPage = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.render('edit-category', { category, user: req.session.user });
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send(error.message);
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        await categoryService.updateCategory(id, name, description);
        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.redirect('/categories');
    } catch (error) {
        console.error('Error:', error);
        res.status(400).send(error.message);
    }
};
