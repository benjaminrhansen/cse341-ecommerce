const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mailer = require('../models/mailer');
const { validationResult } = require('express-validator');

const User = require('../models/user');

// setup how the emails will be delivered
// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     api_key: process.env.MAILER_KEY,
//     //api_user: process.env.MAILER_API_USER
//   }
// }));

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
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    // if any error message exists, its value will be used here
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    },
    validationErrors: [],
    errorMessage: message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // get all errors on the req from our validation middleware
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        //confirmPassword: "",
        //username: "",
      },
      validationErrors: errors.array(),
    });
  }

  // this should already be present from middleware
  // let emptyFieldErrors = {};
  // if (!email && !password) {
  //   emptyFieldErrors = {param: 'password', param: 'email'} 
  // }
  // else if (!password) {
  //   emptyFieldErrors = {param: 'password'}
  // }
  // else if (!email) {
  //   emptyFieldErrors = {param: 'email'} 
  // }


  // don't forget, this call to the database
  // will be run after we connect through our database.js
  // file below in app.listen()
  User.findOne({ email: email })
    .then(user => {
      // check if user didn't login successfully
      if (!user) {
        // key value pairs to output
        // done with errorMessage in the render
        //req.flash('error', 'Invalid email or password.');
        
        // prompt to try again 
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
            //confirmPassword: "",
            //username: "",
          },
          validationErrors: [],
        });
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
              if (err) {
                console.log(err);
                // for now, use middleware to render the error page
                const error = new Error(err); // 'Creating a new product failed.');
                error.httpStatusCode = 500;
                // throw the error onto until an error-handling middleware catches it
                return next(error);
              }
              res.redirect('/');
            });
          }
          // prompt to try again
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: "Login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
              //confirmPassword: "",
              //username: "",
            },
            validationErrors: [],
          });
        })
        .catch(err => {
          console.log(err)
          // for now, use Express to render the error page
          const error = new Error(err); // 'Creating a new product failed.');
          error.httpStatusCode = 500;
          // throw the error onto until an error-handling middleware catches it
          return next(error);
        });
    })
    .catch(err => {
      console.log(err)
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
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

  // get all errors on the req from our validation middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, password: password,
        confirmPassword: req.body.confirmPassword,
        username: name,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  // user verified in routes middleware
  // always hash passwords
  bcrypt.hash(password, 12) // a promise
    // nest it here so we don't do this if the user exists
    .then(hashedPassword => {
      const user = new User({
        email: email,
        name: name ? name : "",
        password: hashedPassword,
        authorized: false,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      // maybe do a flash
      res.redirect('/login');
      
      // handle new user authoriztion request
      console.log("Authorization request sent to:", process.env.MAILER_API_ADMIN, "\n\tfor new user at email address:", req.body.email);
      mailer.send({
        to: process.env.MAILER_API_ADMIN,
        subject: 'New User Authorization Request',
        html: `
            <div>
              <h1>New User Authorization Request</h1>
              <table>
                <tr>
                  <th>Email</th>
                  <th>Name</th> 
                  <th>Request Date</th>
                </tr>
                <tr>
                  <td>${email}</td>
                  <td>${name}</td> 
                  <td>${"Last year bro, jk this time:" + Date.now().toString()}</td>
                </tr>
              </table>
            </div>
            <div>
              <p>Click this <a href="${process.env.MAILER_SERVER_OVERVIEW}">link</a> and add the email to the mail server to complete the new user authorization.</p>
            </div>
          `
      });
      // do not block so if this isn't working
      // put this somewhere else
      /*return transporter.sendMail({
        to: email,
        from: "benjamminhansen@gmail.com",
        subject: "Signup Successful",
        html: "<h1>You have successfully signed up!</h1>"
      });*/
    })
    .catch(err => {
      console.log(err)
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  // destroy the session with the method provided
  // by express-session
  req.session.destroy(err=>{
    if (err) {
      console.log(err);
      // for now, use middleware to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    }
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', "No account with that email found.")
          return res.redirect('/reset');
        }

        // check if user is authorized to receive email
        if (!user.authorized) {
          req.flash('error', 'User is not yet authorized to receive email from the system. Please wait for authorization before requesting a reset password email.')
          return res.redirect('/login');
        }

        // if we found a user, we are looking for a new
        // address that is stored in the database 
        console.log("Setting reset token")
        user.resetToken = token;
        console.log("Setting reset token expiration")
        user.resetTokenExpiration = Date.now() + 3600000; // one hour from now
        console.log("Saving the user")
        return user.save();
      })
      .then(saved_result => {
        res.redirect('/');
        console.log("Sending mail to:", req.body.email);
        mailer.send({
          to: req.body.email,
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err=>{
        console.log(err);
        // for now, use Express to render the error page
        const error = new Error(err); // 'Creating a new product failed.');
        error.httpStatusCode = 500;
        // throw the error onto until an error-handling middleware catches it
        return next(error);
      });
  })  
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // verify token
  const token = req.params.token;
  User.findOne({ 
    resetToken: token, 
    resetTokenExpiration: {
      $gt: Date.now()
    },
  })
  .then(user => {
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  })
  .catch(err => {
    console.log(err);
    // for now, use Express to render the error page
    const error = new Error(err); // 'Creating a new product failed.');
    error.httpStatusCode = 500;
    // throw the error onto until an error-handling middleware catches it
    return next(error);
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: token, 
    resetTokenExpiration: { 
      $gt: Date.now() 
    }
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err=>{
    console.log(err);
    // for now, use Express to render the error page
    const error = new Error(err); // 'Creating a new product failed.');
    error.httpStatusCode = 500;
    // throw the error onto until an error-handling middleware catches it
    return next(error);
  });
};