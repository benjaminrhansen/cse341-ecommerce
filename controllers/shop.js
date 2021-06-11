const Product = require('../models/product'); // a mongoose model
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1; // testing

exports.getProducts = (req, res, next) => {
  const tagSearch = req.query.tagSearch;
  if (tagSearch) {
      console.log("Searching by tag: ", tagSearch)
      Product.fetchByTag(tagSearch)
        .then(products => {
          console.log('Product-list search results:', products);
          res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            //isAuthenticated: req.session.isLoggedIn,
            path: '/products'
          });
        })
        .catch(err => {
          if (err) {
            console.log(err);
            // for now, use Express to render the error page
            const error = new Error(err); // 'Creating a new product failed.');
            error.httpStatusCode = 500;
            // throw the error onto until an error-handling middleware catches it
            return next(error);
          }
          res.render('shop/product-list', {
            prods: [],
            pageTitle: 'All Products',
            //isAuthenticated: req.session.isLoggedIn,
            path: '/products'
          });
        });
      // processing after rendering response
      console.log("Saving past search query: ", tagSearch);
      // save the tag search if we have a user
      if (req.user) {
        // we must manually ensure that only a Set is being
        // stored. Mongoose does not allow Sets so we will
        // make sure the added search query is not a duplicate
        // in the Array and convert the array to a set before
        // saving it back to an array
        // only insert if the tag searched for doesn't already exist in the system
        if (!req.user.pastSearchHistory.includes(tagSearch)) {
          req.user.pastSearchHistory.push(tagSearch);
          return req.user.save(); // save the user to the database
        }
      }
      return;
  } else {
    Product.find() // dosn't return a cursor but the actual array
      .then(products => {
        // console.log(products);
        res.render('shop/product-list', {
          prods: products,
          pageTitle: 'All Products',
          //isAuthenticated: req.session.isLoggedIn,
          path: '/products'
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
  }
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
        //isAuthenticated: req.session.isLoggedIn,
        path: "/products"
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

exports.getAllProductTags = (req, res, next) => {
  console.log("PRODUCT IS: ", Product.getAllPossibleTags);
  Product.getAllPossibleTags()
    .then(allTags => {
      // with help from this tutorial: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
      res.setHeader('Content-Type', 'application/json');
      // send the last write chunk and end the response

      res.end(JSON.stringify([...new Set(allTags)]));
    })
    .catch(err => {
      console.log(err);
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
}

exports.getIndex = (req, res, next) => {
  // convert page to integer
  // if the query is not defined, default to the first page
  const page = +req.query.page || 1;

  Product.find().countDocuments().then(numProducts => {
    const totalItems = numProducts;
    Product.find() // dosn't return a cursor but the actual array
      .skip((page - 1) * ITEMS_PER_PAGE) // skip previous pages
      .limit(ITEMS_PER_PAGE) // limit to max items per page
      .then(products => {
        //console.log(products);
        res.render('shop/index', {
          prods: products,
          pageTitle: 'All Products',
          // isAuthenticated: req.session.isLoggedIn,
          // // generate a token and add it to our views
          // // to prevent CSRF attacks
          // csrfToken: req.csrfToken(), // given by the csrf package
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          path: '/' // main page
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
  });

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
    // populate on the cart for all item productIds the product in the cart
    // this path tells mongoose create a populated array of items given
    // the productId on each item in the items list .... potentially
    .populate('cart.items.product') // an array maybe of actual products
    // populate doesn't return a promise
    .execPopulate() // returns a promise to call then on ...
    .then(user => {
      //console.log("Cart products:", user.cart.items);
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        /* 
        Schema for user.cart.items:
        [
          {product: Object
           quantity: Number},
          ...
        ]
        */
        //isAuthenticated: req.session.isLoggedIn,
        products: user.cart.items ? user.cart.items : []
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

exports.postCart = (req, res, next) => {
  const csrfToken = req.body._csrf;
  console.log("CSRF Token: ", csrfToken);
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  //console.log(prodId);
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    // console.log(result);
    res.redirect('/cart');
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
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  (!prodId) ? console.log("Product ID body parameter not given") : "";
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
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

exports.getOrders = (req, res, next) => {
  // find in the orders collection all documents 
  // which match the user's id
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        //isAuthenticated: req.session.isLoggedIn,
        orders: orders
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

exports.postOrder = (req, res, next) => {
  req.user
    // populate on the cart for all item productIds the product in the cart
    // this path tells mongoose create a populated array of items given
    // the productId on each item in the items list .... potentially
    .populate('cart.items.product') // an array maybe of actual products
    // populate doesn't return a promise
    .execPopulate() // returns a promise to call then on ...
    .then(user => {
      console.log("The user is (type ", typeof user, "):", user);
      console.log("The user.cart is (type ", typeof user.cart, "):", user.cart);
      console.log("The user.cart.items is (type ", typeof user.cart.items, "):", user.cart.items);
      console.log("Cart products:", user.cart.items);
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user // mongoose will get the id from this user object
        },
        products: user.cart.items.map(item => {
          console.log("Product document:", item.product._doc);
          return {
            // save the actual doc and not just the id
            productData: { ...item.product._doc },
            quantity: item.quantity
          }
        })
      });
      return order.save(); // save the new order, return a promise
    })
    .then(result => {
      // we have made the order, we can now clear the cart
      // for the user
      // get a promise because clearing the cart may take some time
      return req.user.clearCart();
    })
    // now we can redirect
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    //isAuthenticated: req.session.isLoggedIn,
    pageTitle: 'Checkout'
  });
};
