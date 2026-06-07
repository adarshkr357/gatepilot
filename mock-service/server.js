const express = require('express');

const app = express();
app.use(express.json());

const products = [
  { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
  { id: 2, name: 'Phone', price: 699, category: 'Electronics', inStock: true },
  { id: 3, name: 'Desk', price: 299, category: 'Furniture', inStock: false },
  { id: 4, name: 'Chair', price: 199, category: 'Furniture', inStock: true },
  { id: 5, name: 'Monitor', price: 149, category: 'Electronics', inStock: true }
];

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'Dave', email: 'dave@example.com', role: 'user' },
  { id: 5, name: 'Eve', email: 'eve@example.com', role: 'manager' }
];

const orders = [
  { id: 1, userId: 1, products: [1, 5], total: 1148, status: 'shipped', createdAt: new Date().toISOString() },
  { id: 2, userId: 2, products: [2], total: 699, status: 'processing', createdAt: new Date().toISOString() },
  { id: 3, userId: 3, products: [3, 4], total: 498, status: 'delivered', createdAt: new Date().toISOString() },
  { id: 4, userId: 4, products: [1], total: 999, status: 'cancelled', createdAt: new Date().toISOString() },
  { id: 5, userId: 5, products: [5], total: 149, status: 'shipped', createdAt: new Date().toISOString() }
];

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/products', (req, res) => res.json(products));
app.get('/users', (req, res) => res.json(users));
app.get('/orders', (req, res) => res.json(orders));

app.post('/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body,
    inStock: req.body.inStock !== false
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'mock-backend' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mock service listening on port ${PORT}`);
});
