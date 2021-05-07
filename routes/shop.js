const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

// query parameters are not routed through
// these routes but sent in the request
router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

// the colon in :productId signals to EJS to create a 
// :productId but instead treat it as a variable
// thus whatever the user types in after the /router/ in the path
// will be assigned to productId and available in the params of the request
router.get('/products/:productId', shopController.getProduct); 
// following this with a static route with the same folder structure will not render!
// example
// router.get('/router/delete'); 
// that's a valid route but EJS won't evaluate it because it's already received a variable dynamic route

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

module.exports = router;
