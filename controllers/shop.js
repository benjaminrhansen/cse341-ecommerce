const Product = require('../models/product').Product; // a mongoose model
const getAllPossibleTags = require('../models/product').getAllPossibleTags;

exports.getProducts = (req, res, next) => {
  Product.find() // dosn't return a cursor but the actual array
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
  // const tagSearch = req.query.tagSearch;
  // if (tagSearch) {
  //     console.log("Searching by tag: ", tagSearch)
  //     Product.fetchByTag(tagSearch)
  //       .then(products => {
  //         res.render('shop/product-list', {
  //             prods: products,
  //             pageTitle: 'All Products',
  //             path: '/products'
  //         });
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         res.render('shop/product-list', {
  //             prods: [],
  //             pageTitle: 'All Products',
  //             path: '/products'
  //         });
  //       })
  //     return;
  // }
  // Product.fetchAll()
  //   .then(products => {
  //     res.render('shop/product-list', {
  //       prods: products,
  //       pageTitle: 'All Products',
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

// handler for getting one product
exports.getProduct = (req, res, next) => {
  // extract the productId we added to the request parameters
  // through the path
  const prodId = req.params.productId; 
  console.log("Looking up product", prodId);
  // mongoose has a findById automatically converted
  // to ObjectID
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getAllProductTags = (req, res, next) => {
  getAllPossibleTags()
    .then(allTags => {
      // with help from this tutorial: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
      res.setHeader('Content-Type', 'application/json');
      // send the last write chunk and end the response

      res.end(JSON.stringify([...new Set(allTags)]));
    })
    .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
  Product.find() // dosn't return a cursor but the actual array
    .then(products => {
      //console.log(products);
      res.render('shop/index', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
  // const tagSearch = req.query.tagSearch;
  // if (!tagSearch) {
  //   Product.fetchAll(products => {
  //     res.render('shop/index', {
  //       prods: products,
  //       pageTitle: 'Shop',
  //       path: '/'
  //     });
  //   });
  // }
  // else {
  //   next(); // just render the next route
  // }
  // Product.fetchAll()
  //   .then(products => {
  //     res.render('shop/index', {
  //       prods: products,
  //       pageTitle: "Shop",
  //       path: '/'
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  console.log(prodId);
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    console.log(result);
  }).catch(err => console.log(err));
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts()
  //   })
  // Product.findById(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // })
  // res.redirect('/cart');
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log("Deleting product:", prodId);
  req.user 
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      res.render('shop/orders' , {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart; 
  req.user 
    .createOrder() // place order on current cart
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
