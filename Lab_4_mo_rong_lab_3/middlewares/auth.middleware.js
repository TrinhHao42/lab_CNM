// Middleware kiểm tra user đã đăng nhập chưa
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Middleware kiểm tra user có role admin không
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            message: 'Bạn không có quyền truy cập chức năng này',
            user: req.session.user
        });
    }

    next();
}

// Middleware kiểm tra user có role admin hoặc staff
function requireStaff(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin' && req.session.user.role !== 'staff') {
        return res.status(403).render('error', {
            message: 'Bạn không có quyền truy cập',
            user: req.session.user
        });
    }

    next();
}

// Middleware thêm user vào locals để sử dụng trong view
function addUserToLocals(req, res, next) {
    res.locals.user = req.session && req.session.user ? req.session.user : null;
    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireStaff,
    addUserToLocals
};
