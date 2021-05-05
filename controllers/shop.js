const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  // we need to give the fetchAll handler a call back
  // to know how to return the products used
  // this allows us to now have to read the file twice
  // and allows handling the scope. High-order functions to the rescue!
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      prods: products, // fix where this is coming from
      pageTitle: 'Shop',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true
    });
  });
}