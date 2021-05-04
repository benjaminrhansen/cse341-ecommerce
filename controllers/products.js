const products = [];

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
}

exports.postAddProduct = (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/', {
    path: "/"
  });
}

exports.getProducts = (req, res, next) => {
  res.render('shop', {
    prods: products, // fix where this is coming from
    pageTitle: 'Shop',
    path: '/',
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true
  });
}