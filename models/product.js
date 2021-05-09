const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const Cart = require('./cart');

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price, tags=[]) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.tags = tags;
    if (this.tags != []) {
      // trim input as needed. Ideally, this would be done on the browser
      this.tags = this.tags.split(",").map(tag => {
        if (typeof(tag) === typeof("")) 
          tag = tag.trim();
        return tag;
      });
    }
  }

  save() {
    this.id = Math.random().toString();

    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(element => element.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      }
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  // creates a new products.json entirely given the list of products
  // writes to the file Asynchronously
  static saveProductsAsIs(products) {
    fs.writeFile(p, JSON.stringify(products), err => {
      console.log(err);
    });
  }
  
  // must use a callback (cb)
  static getAllPossibleTags(cb) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        console.log("getAllPossibleTags: No Tags");
        cb([]);
      } else {
        const products = JSON.parse(fileContent);
        const allTags = products.reduce((accumTags, product) => {
          accumTags.push(...product.tags);
          return accumTags;
        }, []);
        console.log("getAllPossibleTags all tags: ", allTags);
        cb(allTags);
      }
    });
  }
  

  static fetchByTag(tag, cb) {
      getProductsFromFile(products => {
        const filteredProducts = products.filter(prod => prod.tags.includes(tag));
      cb(filteredProducts);
    })
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(elem => elem.id === id);
      cb(product);
    })
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id);
      // get all other items
      const updatedProducts = products.filter(elem => elem.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  // Add a "unique" id (using Math.random for now) to every item that doesn't have a unique
  // idea
  static addUniqueIds() {
    this.fetchAll(products => {
      const updatedProducts = products.map(product => {
        // if the product doesn't already have an id, add one
        if (!product.id) {
          product.id = Math.random().toString();
        }
        // always return the product
        return product;
      });
      // save the products asynchronously
      this.saveProductsAsIs(products);
    });
  }
};
