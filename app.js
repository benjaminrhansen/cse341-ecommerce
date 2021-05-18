// from the docs: https://www.npmjs.com/package/dotenv
// "As early as possible in your application, require and configure dotenv."
require('dotenv').config()

const path = require('path');
const PORT = process.env.PORT || 3000 // So we can run on heroku || (OR) localhost:3000

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const errorController = require('./controllers/error');
const User = require('./models/user');
//const mongoConnect = require('./util/database').mongoConnect;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // don't forget, this call to the database
    // will be run after we connect through our database.js
    // file below in app.listen()
    User.findById(process.env.ADMIN_ID)
        .then(user => {
            console.log("User found:", user);
            // console.log("User's cart: ", user.cart)
            req.user = user; // mongoose object
            next(); // send requests to the next handler
        })
       .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

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
    User.findOne()
        .then(user => {
            if (!user) {
                const user = new User({
                    name: "Benjamin",
                    email: "benjamminhansen@gmail.com",
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
    console.log("mongoose connected")
    //console.log(result);
    app.listen(PORT, () => { console.log("Listening on port ", PORT) });
  })
  .catch(err => {
    console.log("What's happening?")
    console.log(err);
  });

// mongoConnect(() => {
//     // load in the only user
//     app.listen(PORT, () => { console.log("Listening on port ", PORT) });
// });
