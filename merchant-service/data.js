const merchants = [
    { 
        id: 'merchant12', name: 'Flipcart Store', email: 'flipcart@example.com' 
    },
];

const products = [
    { id: 'prod1', merchantId: 'merchant1', name: 'Wireless Mouse', price: 25.00 },
    { id: 'prod2', merchantId: 'merchant1', name: 'Wireless keyboard', price: 55.00 },
];

module.exports = { merchants, products };