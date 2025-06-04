// Load environment variables from .env file FIRST
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Environment Config
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not defined in .env file!');
    process.exit(1);
}

// Simulated User Store (for login)
const users = [
    { username: 'customer1', password: 'customer@123', role: 'customer', id: 'customer1' },
    { username: 'merchant1', password: 'merchant@123', role: 'merchant', id: 'merchant1' },
];

// Service URLs
const SERVICE_URLS = {
    customer: 'http://localhost:3001',
    merchant: 'http://localhost:3002',
    bank: 'http://localhost:3003',
};

// --- JWT Authentication Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).send('Missing or invalid token');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid or expired token');
        req.user = user;
        next();
    });
};

// --- Role-based Authorization Middleware ---
const authorize = (roles) => (req, res, next) => {
    const { role } = req.user;
    if (roles.includes(role)) return next();
    return res.status(403).send('Forbidden: Insufficient permissions');
};

// --- Utility to forward requests to internal services ---
const forwardRequest = async ({ serviceKey, action, reqData, user, res }) => {
    try {
        const payload = {
            action,
            ...reqData,
            user: { id: user.id, role: user.role },
        };

        const response = await fetch(SERVICE_URLS[serviceKey], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error(`[Error][${action}]`, error.message);
        return res.status(500).send(`Internal server error: ${action}`);
    }
};

// --- Auth Route ---
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};

   if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid or missing JSON body' });
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.json({ message: 'Login successful', token });
});

app.get('/customer/profile', authenticate, authorize(['customer']), (req, res) => {

	forwardRequest({
        serviceKey: 'customer',
        action: 'getCustomerProfile',
        reqData: { customerId: req.user.id },
        user: req.user,
        res
    });
});

app.post('/customer/order', authenticate, authorize(['customer']), (req, res) => {
	console.log('ddd');
    forwardRequest({
        serviceKey: 'customer',
        action: 'createCustomerOrder',
        reqData: { ...req.body, customerId: req.user.id },
        user: req.user,
        res
    });
});

// --- Merchant ---
app.get('/merchant/products', authenticate, authorize(['merchant']), (req, res) => {
    forwardRequest({
        serviceKey: 'merchant',
        action: 'getProducts',
        reqData: { merchantId: req.user.id },
        user: req.user,
        res
    });
});

app.post('/merchant/product', authenticate, authorize(['merchant']), (req, res) => {
    forwardRequest({
        serviceKey: 'merchant',
        action: 'addProduct',
        reqData: { ...req.body, merchantId: req.user.id },
        user: req.user,
        res
    });
});

// --- Bank ---
app.post('/bank/process-payment', authenticate, (req, res) => {
    forwardRequest({
        serviceKey: 'bank',
        action: 'processPayment',
        reqData: req.body,
        user: req.user,
        res
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log( `API Gateway running at http://localhost:${PORT}`);
});
