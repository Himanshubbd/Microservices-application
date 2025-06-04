const express = require('express');
const bodyParser = require('body-parser');
const { transactions } = require('./data');

const app = express();
const PORT = 3003;

app.use(bodyParser.json());

//Route handling with the actiom 
app.post('/', (req, res) => {
    const { action, ...data } = req.body; // Destructuring the inputs received from the user.

    switch (action) {
        case 'processPayment':
            const { amount, currency, sourceAccount, destinationAccount, orderId } = data;

            if (!amount || !currency || !sourceAccount || !destinationAccount || !orderId) {
                return res.status(400).send('payment fields are required.');
            }

            const transactionId = `txn${transactions.length + 1}`;
            const newTransaction = {
                id: transactionId,
                amount,
                currency,
                sourceAccount,
                destinationAccount,
                orderId,
                status: 'completed',
                timestamp: new Date().toISOString()
            };

            transactions.push(newTransaction);
            console.log(`Processed payment: ${JSON.stringify(newTransaction)}`);
            res.status(200).json({
                message: 'Payment  has been processed successfully',
                transaction: newTransaction
            });
            break;

        default:
            res.status(400).send(`Unknown action: ${action}`);
            break;
    }
});

app.listen(PORT, () => {
    console.log(`Bank Service running on port ${PORT}`);
});