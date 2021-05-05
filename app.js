const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const PORT = process.env.PORT || 3000 // So we can run on heroku || (OR) localhost:3000

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminController = require('./routes/admin');
const shopController = require('./routes/shop');
const errorController = require('./controllers/404');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// application-specific routes
app.use('/admin', adminController);
app.use(shopController);

app.use(errorController.get404);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
