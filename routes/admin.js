const path = require('path');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
// these routes receive as many handlers as desired, processing
// them from left to right as given in the parameters
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .withMessage('Invalid title. Must be text with at least 3 characters.')
        .trim(),
    body('imageUrl')
        .isURL() // validate that the url is valid
        .withMessage('Invalid image URL.'),
    body('price')
        .isFloat()
        .withMessage('Only dollar values for price are allowed.')
        .custom((price,  { req }) => {
            if (price < 0) throw new Error('Price must be positive.');
            // else
            return true;
        }),
        /* to check if it's a number .isNumeric(),*/
    body('description')
        // if desired
        //.isLength({ min: 5, max: 400 })
], isAuth, adminController.postAddProduct);

router.post('/edit-product', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .withMessage('Invalid title. Must be text with at least 3 characters.')
        .trim(),
    body('imageUrl')
        .isURL() // validate that the url is valid
        .withMessage('Invalid image URL.'),
    body('price')
        .isFloat()
        .withMessage('Only dollar values for price are allowed.')
        .custom((price,  { req }) => {
            if (price < 0) throw new Error('Price must be positive.');
            // else
            return true;
        }),
        /* to check if it's a number .isNumeric(),*/
    body('description')
        // if desired
        //.isLength({ min: 5, max: 400 })
], isAuth, adminController.postEditProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct); //

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get("/user/past-search", isAuth, adminController.getUserPastSearchHistory);

router.get("/user/authorizations", isAuth, adminController.getUserAuthorizations);

router.post("/user/authorizations", isAuth, adminController.postUserAuthorizations);

router.post("/user/authorizations/authorize-all", isAuth, adminController.postUserAuthorizationsAuthorizeAll);

router.use("/user/mailer-overview-link", isAuth, (req, res, next) => {
    console.log("Redirecting to the Mailer Overview Link:", process.env.MAILER_OVERVIEW_LINK);
    res.redirect(process.env.MAILER_OVERVIEW_LINK);
});

// router.use('/update-ids', adminController.postAddUniqueIds);

module.exports = router;
