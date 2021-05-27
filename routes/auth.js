const express = require('express');
const { check, body/*, validation, header, query, param, cookie, ...*/ } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage("Please enter a valid email")
            .normalizeEmail(),
            // not needed
            // .custom((email, { req } )=> {
            //     return User.findOne({ email: email })
            //         .then(userDoc => {
            //             // don't allow one user credential to signup twice
            //             if (!userDoc) {
            //                 // return a reject promise
            //                 return Promise.reject('E-Mail exists already, please pick a different one.');
            //             }
            //         });
            // })
        body('password', 'Password is not valid.').isLength({min: 12})
            .trim() // trim extra whitespace off the ends
    ],
    authController.postLogin);

// add a middleware to validate input 
// check returns a middleware
// tell check to validate the email body parameter
// check will look in the body, parameters, query, or cookies for the
// named input element in the request you are trying to validate
// if the email does not pass the isEmail checks, then display the following 
// error message
router.post('/signup', 
    // give an array of middlewares
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail()
            /*.isAlphanumeric()*/
            .custom((email, { req }) => {
                return User.findOne({ email: email })
                    .then(userDoc => {
                        // don't allow one user credential to signup twice
                        if (userDoc) {
                            // return a reject promise
                            return Promise.reject('E-Mail exists already, please pick a different one.');
                        }
                    });
                // if (email === "test@test.com") {
                //     throw new Error('This email address is forbidden.');
                // }
                // // else return true, validation passed
                // return true;
            }),
        // only worry about checking for passwords in the body 
        body('password', /*second arg can specify error message*/
             'Please enter a password with at least 12 characters')
            .isLength({min: 12, /*max: Number*/})
            .trim(), // trim extra whitespace off the ends
        // check password confirmation
        body('confirmPassword')
            .trim()
            .custom(( value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords must match.');
                }
                return true;
            })
    ], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;