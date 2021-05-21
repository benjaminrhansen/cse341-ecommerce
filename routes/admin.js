const path = require('path');
const isAuth = require('../middleware/is-auth');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
// these routes receive as many handlers as desired, processing
// them from left to right as given in the parameters
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct); //

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get("/user/past-search", adminController.getUserPastSearchHistory);

// router.use('/update-ids', adminController.postAddUniqueIds);

module.exports = router;
