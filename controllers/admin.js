const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    hasError: false,
    errorMessage: undefined,
    // added globally
    //isAuthenticated: req.session.isLoggedIn,
    validationErrors: [],
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const tags = req.body.tags ?
    req.body.tags.split(",").map(tag => {
      if (typeof (tag) === typeof (""))
        tag = tag.trim();
      return tag;
    }) : [];
  
  const errors = validationResult(req);
  // check for errors
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      // added globally
      //isAuthenticated: req.session.isLoggedIn,
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        tags: tags,
      },
      validationErrors: errors.array(),
    });
  }

  // trim input as needed. Ideally, this would be done on the browser
  console.log("Here are the tags:", tags);
  const product = new Product({
    title: title, 
    imageUrl: imageUrl, 
    description: description, 
    price: price, 
    tags: tags,
    userId: req.user // mongoose will pick the id from this object
  });
  // the save method comes from mongoose
  product
    .save() // mongoose call
    // after the save promise has evaluated, do
    .then(result => {
      console.log("Created Product");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
      // we could redirect with a 500 error code
      //res.status(500).redirect('/500'); 

      // another option
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   // added globally
      //   //isAuthenticated: req.session.isLoggedIn,
      //   editing: false,
      //   hasError: true,
      //   errorMessage: "Database operation failed. Please try again.",
      //   product: {
      //     title: updatedTitle,
      //     imageUrl: updatedImageUrl,
      //     price: updatedPrice,
      //     description: updatedDescription,
      //     tags: updatedTags,
      //     _id: prodId,
      //   },
      //   validationErrors: [],
      // });
    });

};

exports.getEditProduct = (req, res, next) => {
  // extract the string (and it's always a string) value corresponding to the edit key if it exists
  const editMode = req.query.edit;
  if (!editMode) {
    console.log("editMode not set. Return to the usual home page")
    return res.redirect('/');
  }

  // extract the prodId
  const prodId = req.params.productId;
  // check if the id exists
  Product.findById(prodId)
    .then(product => {
      // if not? just redirect to the home page of this route
      if (!product) {
        return res.redirect('/');
      }
      // the default status code for render is 200
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        errorMessage: undefined,
        hasError: false,
        editing: editMode,
        //isAuthenticated: req.session.isLoggedIn,
        product: product,
        validationErrors: [],
      });
    })
    .catch(err => {
      console.log(err)
      // for now, use middleware to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId; 
  console.log("Trying to save product:", prodId);
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedTags = req.body.tags ?
    req.body.tags.split(",").map(tag => {
      if (typeof (tag) === typeof (""))
        tag = tag.trim();
      return tag;
    }) : [];

  const errors = validationResult(req);
  // check for errors
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      // added globally
      //isAuthenticated: req.session.isLoggedIn,
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        tags: updatedTags,
        _id: prodId,
      },
      validationErrors: errors.array(),
    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        // the default status code for redirect is 300
        return res.redirect('/');
      }
      // mongoose object
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      product.tags = updatedTags;
      console.log("Saving the edited product:", product);
      product
        .save().then(result => {
          console.log("Updated Product");
          res.redirect('/admin/products');
        }) // does an update
    })
    .catch(err => {
      console.log(err);
      // for now, use Express to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);

      // we could  redirect with a 500 error code
      //res.status(500).redirect('/500'); 
      // we could just update the currently-used view
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: 'Edit Product',
      //   path: '/admin/edit-product',
      //   // added globally
      //   //isAuthenticated: req.session.isLoggedIn,
      //   editing: true,
      //   hasError: true,
      //   errorMessage: "Database operation failed. Please try again.",
      //   product: {
      //     title: updatedTitle,
      //     imageUrl: updatedImageUrl,
      //     price: updatedPrice,
      //     description: updatedDescription,
      //     tags: updatedTags,
      //     _id: prodId,
      //   },
      //   validationErrors: [],
      // });

    });
  // const updatedProduct = new Product({
  //   updatedTitle,
  //   updatedImageUrl,
  //   updatedDescription,
  //   updatedPrice,
  //   updatedTags,
  //   // prodId, // we're updating a product
  //   // req.user._id
  // });
  // updatedProduct.save()
  //   // after the save promise has evaluated, do
  //   .then(result => {
  //     console.log("Updated Product");
  //     res.redirect('/admin/products');
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};


exports.getProducts = (req, res, next) => {
  // filter by the currently logged in user
  // so that not all products are shown
  /// req.user came from previous middleware
  Product.find({userId: req.user._id})
    // populate populates a field with all the information and not just the id - Maxamillion
    // .populate('userId', 'name')
    // select allows you to specify which fields should be returned from the database
    //.select('title price -_id') 
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: "Admin Products",
        errorMessage: undefined,
        //isAuthenticated: req.session.isLoggedIn,
        path: '/admin/products',
        validationErrors: [],
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
  // Product.fetchAll(products => {
  //   res.render('admin/products', {
  //     prods: products,
  //     pageTitle: 'Admin Products',
  //     path: '/admin/products'
  //   });
  // });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })//.findByIdAndRemove(prodId)
    .then(result => {
      console.log("Product deleted");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
      // for now, use middleware to render the error page
      const error = new Error(err); // 'Creating a new product failed.');
      error.httpStatusCode = 500;
      // throw the error onto until an error-handling middleware catches it
      return next(error);
    });
};

exports.getUserPastSearchHistory = (req, res, next) => {
  // get the past search history of the current session
  // user
  // req.user would be added by app.js by default if 
  // the user's session was active
  if (req.user) {
    console.log("Found past search history:", req.user.pastSearchHistory);
    res.setHeader('Content-Type', 'application/json');
    // send the last write chunk and end the response
    return res.end(JSON.stringify(req.user.pastSearchHistory));
  } else { // no current user, return an empty list
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([])); // no history
  }
};

// 'admin/user/authorizations' => GET
exports.getUserAuthorizations = (req, res, next) => {
  if (req.user) {
    return res.render('admin/user-authorizations', {
      path: '/admin/user/authorizations',
      pageTitle: 'Admin User Authorizations',
      users: [req.user],
    }, function(err, html) {
      // error handling flow from https://stackoverflow.com/questions/7283896/how-can-i-catch-a-rendering-error-missing-template-in-node-js-using-express-js/15689798
      if (err) {
        console.log(err)
        res.redirect('/404'); // File doesn't exist
      } else {
        res.send(html);
      }
    });
  }
  // else redirect to the login screen
  res.redirect('/login')
};

// 'admin/user/authorizations' => POST
exports.postUserAuthorizations = (req, res, next) => {
  res.redirect('/');
};

// 'admin/update-ids' => POST
// exports.postAddUniqueIds = (req, res, next) => {
//   Product.addUniqueIds();
//   res.setHeader('Content-Type', 'application/json');
//   // send the last write chunk and end the response
    
//   res.end(JSON.stringify({ message: "IDs successfully updated" }));
// };