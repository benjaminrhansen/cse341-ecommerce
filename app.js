const path = require('path');
const PORT = process.env.PORT || 3000 // So we can run on heroku || (OR) localhost:3000

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const mongoConnect = require('./util/database').mongoConnect;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("609c315c1313e6403019f4df")
        .then(user => {
            console.log("User found:", user);
            console.log("User's cart: ", user.cart)
            req.user = new User(user.name, user.email, user.cart, user._id); // add a user attribute to the request
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    console.log("Connected to client");
    app.listen(PORT, () => console.log(`Listening on port ${ PORT }`));
});