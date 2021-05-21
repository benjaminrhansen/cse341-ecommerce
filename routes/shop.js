const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// query parameters are not routed through
// these routes but sent in the request
router.get('/', shopController.getIndex);

// searchController now contains the new router.get('/products', shopController.getProducts); // must call next if not tagSearch
router.get('/products',shopController.getProducts);

// // must be placed before the next get route or else it will 
// // never match
router.get('/products/allTags', shopController.getAllProductTags);

// the colon in :productId signals to EJS to create a 
// :productId but instead treat it as a variable
// thus whatever the user types in after the /router/ in the path
// will be assigned to productId and available in the params of the request
router.get('/products/:productId', shopController.getProduct); 
// following this with a static route with the same folder structure will not render!
// example
// router.get('/router/delete'); 
// that's a valid route but EJS won't evaluate it because it's already received a variable dynamic route


router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
