const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// setup how the emails will be delivered
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.MAILER_KEY
    //api_user: ,
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  // req.isLoggedIn = true; // update this 
  // req.isLoggedIn = req.get('Cookie')
  //   .split(':')[1]
  //   .trim()
  //   .split('=')[1];
  console.log("User is logged in:", req.session.isLoggedIn);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    // if any error message exists, its value will be used here
    errorMessage: req.flash('error')
  });
};
exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // don't forget, this call to the database
  // will be run after we connect through our database.js
  // file below in app.listen()
  User.findOne({email: email})
    .then(user => {
      // check if user didn't login successfully
      if (!user) {
        // key value pairs to output
        req.flash('error', 'Invalid email or password.');
        // try again 
        return res.redirect('/login');
      }
      // validate the password
      // compares the hashed password with the 
      // bcrypt algo used with the user's 
      // password saved in the database
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          // if the passwords match
          if (doMatch) {
            //console.log("User found:", user);
            // console.log("User's cart: ", user.cart)
            // storing this in the session datastore puts it in
            // the database, not on the machine
            req.session.user = user; // mongoose object
            // assume the user is logged in already
            req.session.isLoggedIn = true;
            // we only need to manually save if we need
            // to do an important request right after setting session
            // properties
            return req.session.save(err => {
              err ? console.log(err) : null;
              res.redirect('/');
            });
            return res.redirect('/');
          }
          // try again
          res.redirect('/login');
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  // cookies should not be used for authentication
  // instead, use sessions
  // the session property is added by the express-session middleware
  // sessions persist
  // don't store it in memory.... not secure and consumes too much space
  // store it in the mongodb database
  // req.session // we can edit any cookie attribute or request property we want
  //   .isLoggedIn = true;

  /* {
  dissertation...
  //req.isLoggedIn = true; // undefined by default before this
  // this will not work to keep the user authenticated across
  // subsequent requests. Each new request is independent of the
  // rest and therefore any attributes like req.isLoggedIn will
  // not be present after the req.redirect. We need to use cookies

  // make a cookie
  // we can also set default cookie attributes like Max-Age
  // or Secure or Http-Only
  //res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10');
  } */
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // find one user if 
  User.findOne({email: email})
  .then(userDoc => {
    // don't allow one user credential to signup twice
    if (userDoc) {
      req.flash('error', 'E-Mail already exists.');
      return res.redirect('/signup');
    }

    // else add a new user
    // always has passwords
    return bcrypt.hash(password, 12) // a promise
      // nest it here so we don't do this if the user exists
      .then(hashedPassword => {
        const user = new User({
          email: email,
          name: name ? name : "",
          password: hashedPassword,
          cart: { items: [] }
        });
        return user.save();
      });
})
  .then(result => {
    res.redirect('/login');
    // do not block so if this isn't working
    // put this somewhere else
    /*return transporter.sendMail({
      to: email,
      from: "benjamminhansen@gmail.com",
      subject: "Signup Successful",
      html: "<h1>You have successfully signed up!</h1>"
    });*/
  })
  .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // destroy the session with the method provided
  // by express-session
  req.session.destroy(err=>{
    // log any errors
    err ? console.log(err) : null;
    res.redirect('/');
  });
};
