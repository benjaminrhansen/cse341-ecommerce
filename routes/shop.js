const path = require('path');

const express = require('express');

const shopController = require('../controllers/products');

const router = express.Router();

router.get('/', shopController.getProducts);

module.exports = router;
