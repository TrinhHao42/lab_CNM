const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.render('products', { products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

router.post('/add', async (req, res) => {
  const { name, price, quantity } = req.body;
  await db.query(
    'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity]
  );
  res.redirect('/');
});

router.get('/edit/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.redirect('/');
    }
    res.render('edit-product', { product: rows[0] });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.post('/edit/:id', async (req, res) => {
  const { name, price, quantity } = req.body;
  await db.query(
    'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?',
    [name, price, quantity, req.params.id]
  );
  res.redirect('/');
});

router.get('/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
