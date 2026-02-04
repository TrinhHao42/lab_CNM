const express = require('express');
const session = require('express-session');
require('dotenv').config();

const authRouter = require('./routes/auth.routes');
const productsRouter = require('./routes/product.routes');
const categoriesRouter = require('./routes/category.routes');
const { addUserToLocals } = require('./middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.set('view engine', 'ejs');

app.use(addUserToLocals);

app.use('/', authRouter);
app.use('/', productsRouter);
app.use('/', categoriesRouter);

app.get('/', (req, res) => {
    res.redirect('/products');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});