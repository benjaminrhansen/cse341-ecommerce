const Product = require('../models/product').Product;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
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
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
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

  Product.findById(prodId)
    .then(product => {
      // mongoose object
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      product.tags = updatedTags;
      console.log("Saving the edited product:", product);
      product
        .save() // does an update
      console.log("Updated Product");
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
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
  Product.find()
    // populate populates a field with all the information and not just the id - Maxamillion
    // .populate('userId', 'name')
    // select allows you to specify which fields should be returned from the database
    //.select('title price -_id') 
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: "Admin Products",
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
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
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("Product deleted");
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

// 'admin/update-ids' => POST
// exports.postAddUniqueIds = (req, res, next) => {
//   Product.addUniqueIds();
//   res.setHeader('Content-Type', 'application/json');
//   // send the last write chunk and end the response
    
//   res.end(JSON.stringify({ message: "IDs successfully updated" }));
// };