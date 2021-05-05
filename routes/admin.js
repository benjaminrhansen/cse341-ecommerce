const path = require('path');

const express = require('express');
const { doesNotMatch } = require('assert');

const adminController = require(path.join(__dirname, '..', 'controllers', 'admin'));
const shopController = require(path.join(__dirname, '..', 'controllers', 'shop'));

const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// /admin/products => GET
router.get('/admin/products');


module.exports = router;


