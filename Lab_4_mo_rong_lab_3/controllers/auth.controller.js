const userService = require('../services/user.service');

exports.getLoginPage = (req, res) => {
    // Nếu đã đăng nhập thì redirect về trang chủ
    if (req.session && req.session.user) {
        return res.redirect('/products');
    }
    
    res.render('login', { error: null });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate
        if (!username || !password) {
            return res.render('login', { 
                error: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
            });
        }

        // Đăng nhập
        const user = await userService.login(username, password);

        // Lưu user vào session
        req.session.user = user;

        res.redirect('/products');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
};

// Trang đăng ký (chỉ dùng để tạo user ban đầu, có thể bỏ hoặc chỉ cho admin)
exports.getRegisterPage = (req, res) => {
    res.render('register', { error: null, success: null });
};

exports.register = async (req, res) => {
    try {
        const { username, password, confirmPassword, role } = req.body;

        // Validate
        if (!username || !password) {
            return res.render('register', { 
                error: 'Vui lòng nhập đầy đủ thông tin',
                success: null
            });
        }

        if (password !== confirmPassword) {
            return res.render('register', { 
                error: 'Mật khẩu không khớp',
                success: null
            });
        }

        if (password.length < 6) {
            return res.render('register', { 
                error: 'Mật khẩu phải có ít nhất 6 ký tự',
                success: null
            });
        }

        // Tạo user
        const userRole = role || 'staff';
        await userService.createUser(username, password, userRole);

        res.render('register', { 
            error: null,
            success: 'Đăng ký thành công! Vui lòng đăng nhập.'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.render('register', { 
            error: error.message,
            success: null
        });
    }
};
