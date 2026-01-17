const express = require('express');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'my-secret-key-12345',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

const checkAuth = (req, res, next) => {
  if (!req.session.user && req.path !== '/login' && !req.path.startsWith('/login')) {
    return res.redirect('/login');
  }
  next();
};

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');

app.use('/', authRoutes);
app.use('/', checkAuth, productRoutes);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});