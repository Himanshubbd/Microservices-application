const express = require('express');
const bodyParser = require('body-parser');
const { merchants, products } = require('./data');

const app = express();
const PORT = 3002;

app.use(bodyParser.json());
//Single routes and handling with the acction

app.post('/', (req, res) => {
    const { action, ...data } = req.body;

    switch (action) {
        case 'getProducts':
            const merchantProducts = products.filter(p => p.merchantId === data.merchantId);
            res.json(merchantProducts);
            break;

        case 'addProduct':
            const { merchantId, name, price } = data;
            if (!merchantId || !name || !price) {
                return res.status(400).send('Missing required fields for adding products');
            }
            const newProduct = {
                id: `prod${products.length + 1}`,
                merchantId,
                name,
                price,
                createdAt: new Date().toISOString()
            };
            products.push(newProduct);
            res.status(201).json(newProduct);
            break;

        default:
            res.status(400).send(`Unknown action: ${action}`);
            break;
    }
});

app.listen(PORT, () => {
    console.log(`Merchant Service running on port ${PORT}`);
});