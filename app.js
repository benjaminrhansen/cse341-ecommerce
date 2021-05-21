// from the docs: https://www.npmjs.com/package/dotenv
// "As early as possible in your application, require and configure dotenv."
require('dotenv').config()

const path = require('path');
const PORT = process.env.PORT //|| 3000 // So we can run on heroku || (OR) localhost:3000

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
// call the function returned with the session
const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const authRoutes = require('./routes/auth');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');
//const mongoConnect = require('./util/database').mongoConnect;

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGODB_URL,
    collection: 'sessions'
    // extras as well 
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret', 
    resave: false, 
    store: store,
    saveUninitialized: false
    /*, cookie: {}*/
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    // check if the user for this session exists
    if (req.session.user) {
        // get the user from the current user id of the session
        User.findById(req.session.user._id)
            .then(user => {
                // the req.session is not a mongoose model object
                // so to get all the mongoose model methods we
                // need to set a request parameter
                req.user = user;

                next(); // carryon to the next middleware
            })
            .catch(err => console.log(err));
    } else {
        return next();
    }
});

app.use((req, res, next) => {
    // locals available on the browser
    res.locals.isAuthenticated = req.session.isLoggedIn;
    // generate a new token by calling the 
    // csrfToken() function
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use((req, res, next) => {
//     // don't forget, this call to the database
//     // will be run after we connect through our database.js
//     // file below in app.listen()
//     User.findById(process.env.ADMIN_ID)
//         .then(user => {
//             //console.log("User found:", user);
//             // console.log("User's cart: ", user.cart)
//             req.session.user = user; // mongoose object
//             next(); // send requests to the next handler
//         })
//        .catch(err => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


const corsOptions = {
    origin: "https://thawing-stream-34012.herokuapp.com",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

const MONGODB_URL = process.env.MONGODB_URL 
// for when your ready to use mongoose
mongoose
  .connect(
    MONGODB_URL, options
  )
  .then(result => {
    console.log("mongoose connected")
    //console.log(result);
    app.listen(PORT, () => { console.log("Listening on port ", PORT) });
      // old code for if we didn't have a sign-up page
    // User.findOne()
    //     .then(user => {
    //         if (!user) {
    //             const user = new User({
    //                 name: "Benjamin",
    //                 email: "benjamminhansen@gmail.com",
    //                 cart: {
    //                     items: []
    //                 }
    //             });
    //             user.save();
    //         }
    //     });
  })
  .catch(err => {
    console.log("What's happening?")
    console.log(err);
  });

// mongoConnect(() => {
//     // load in the only user
//     app.listen(PORT, () => { console.log("Listening on port ", PORT) });
// });
