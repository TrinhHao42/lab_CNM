const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');

class UserService {
    async login(username, password) {
        // Tìm user theo username
        const user = await userRepository.findByUsername(username);
        
        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // Không trả về password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async createUser(username, password, role = 'staff') {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await userRepository.findByUsername(username);
        
        if (existingUser) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const user = {
            userId: crypto.randomUUID(),
            username,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        };

        await userRepository.create(user);

        // Không trả về password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async getAllUsers() {
        const users = await userRepository.getAll();
        // Loại bỏ password khỏi kết quả
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
}

module.exports = new UserService();
