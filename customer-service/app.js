const express = require('express');
const bodyParser = require('body-parser');
const { customers, orders } = require('./data');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

app.post('/', (req, res) => {
    const { action, ...data } = req.body; // Destructure action and form input data

    switch (action) {
        case 'getCustomerProfile':
            const customer = customers.find(c => c.id === data.customerId);
            if (customer) {
                res.json(customer);
            } else {
                res.status(404).send('Customer not found');
            }
            break;

        case 'createCustomerOrder':
            const { customerId, item, price } = data;
            if (!customerId || !item || !price) {
                return res.status(400).send('Order creation fields are required.');
            }
            const newOrder = {
                id: `order${orders.length + 1}`,
                customerId,
                item,
                price,
                status: 'created',
                timestamp: new Date().toISOString()
            };
            orders.push(newOrder);
            res.status(201).json(newOrder);
            break;
        default:
            res.status(400).send(`Unknown action: ${action}`);
            break;
    }
});

app.listen(PORT, () => {
    console.log(`Customer Service running on port ${PORT}`);
});