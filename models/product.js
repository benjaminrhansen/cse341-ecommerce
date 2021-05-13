const fs = require('fs');
const path = require('path');

const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

// const getProductsFromFile = cb => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

module.exports = class Product {
  constructor(title, imageUrl, description, price, tags = "", id, userId) {
    // mongodb will create a unique id for us
    this._id = id ? new mongodb.ObjectID(id) : null; // id may be undefined, which if so mongodb will add one
    this.userId = userId ? new mongodb.ObjectID(userId) : null;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.tags = tags;
    if (this.tags != "") {
      // trim input as needed. Ideally, this would be done on the browser
      console.log("Here are the tags:", this.tags);
      this.tags = this.tags.split(",").map(tag => {
        if (typeof (tag) === typeof (""))
          tag = tag.trim();
        return tag;
      });
    }
  }

  save() {
    const db = getDb();
    let dbOp; // for dbOperation
    // if an id is specified, we're updating 
    // a product
    if (this._id) {
      // update 
      dbOp = db.collection('products')
        // updates a single item via a find object
        .updateOne({
          _id: new mongodb.ObjectID(this._id)
        }, {
          $set: this // a special mongodb parameter of how to update the product
        });
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    // get a collection from the database
    // return the promise created in this chain of calls
    return dbOp
      .then(result => {
        console.log("Result:", result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  

  // getProductsFromFile(products => {
  //   // if this product has an id, then it's already 
  //   // been saved in the database
  //   if (this.id) {
  //     // update the existing product
  //     const existingProductIndex = products.findIndex(element => element.id === this.id);
  //     const updatedProducts = [...products];
  //     updatedProducts[existingProductIndex] = this;
  //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
  //       console.log(err);
  //     });
  //     return; // don't write to the file twice
  //   }
  //   // otherwise add this product and save it to the database
  //   this.id = Math.random().toString(); // assign it an id
  //   products.push(this);                // add to current products
  //   // save to the database
  //   fs.writeFile(p, JSON.stringify(products), err => {
  //     console.log(err);
  //   });
  // }); 

  static fetchAll() {
    const db = getDb();
    // find and other collection methods return a handle
    // or cursor to iterate through all the documents returned
    // one by one instead of having all of them in memory all
    // at once
    return db.collection('products').find(
      // we can give a pattern object like {title: "Heyo"} to search
      // for specific products
      // leave empty to find all
    )
      // this will turn all documents into a JS array, 
      // only use for small data
      // toArray() returns a Promise
      .toArray() // better to use pagination and not toArray() ...
      .then(products => {
        console.log(products);
        return products;
      })
      .catch(err => {
        console.log(err);
        return [];
      });
    // getProductsFromFile(cb);
  }

  // creates a new products.json entirely given the list of products
  // writes to the file Asynchronously
  // static saveProductsAsIs(products) {
  //   fs.writeFile(p, JSON.stringify(products), err => {
  //     console.log(err);
  //   });
  // }

  static getAllPossibleTags() {
    return this.fetchAll() // returns a promise
      .then(products => {
        const allTags = products.reduce((accumTags, product) => {
          accumTags.push(...product.tags);
          return accumTags;
        }, []);
        console.log("getAllPossibleTags all tags: ", allTags);
        return allTags;
      })
      .catch(err => {
        console.log("getAllPossibleTags: No Tags");
        return [];
      });
  }


  static fetchByTag(tag) {
    const db = getDb();
    return db.collection('products')
      .find({ tags: [tag] })
      .then(filteredProducts => {
        return filteredProducts;
      })
      .catch(err => {
        console.log(err)
        return [];
      });
  }

  static findById(prodId, cb) {
    // getProductsFromFile(products => {
    //   const product = products.find(elem => elem.id === id);
    //   cb(product);
    // })
    const db = getDb();
    return db.collection('products')
      .find({
        _id: new mongodb.ObjectID(prodId) // ids are stored in a special ObjectID format
      })
      // just do next one time to get the next product found by the id
      .next() // find will return a cursor but there only should be one
      .then(product => {
        console.log(product)
        return product;
      })
      .catch(err =>
        console.log(err)
      );
  }

  static deleteById(id) {
    const db = getDb();
    return db.collection('products')
      .deleteOne({
        _id: new mongodb.ObjectID(id)
      })
      .then(result => {
        console.log("Deleted");
      })
      .catch(err => {
        console.log(err);
      });
    // getProductsFromFile(products => {
    //   const product = products.find(prod => prod.id === id);
    //   // get all other items
    //   const updatedProducts = products.filter(elem => elem.id !== id);
    //   fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //     if (!err) {
    //       Cart.deleteProduct(id, product.price);
    //     }
    //   });
    // });
  }

  // // Add a "unique" id (using Math.random for now) to every item that doesn't have a unique
  // // idea
  // static addUniqueIds() {
  //   this.fetchAll(products => {
  //     const updatedProducts = products.map(product => {
  //       // if the product doesn't already have an id, add one
  //       if (!product._id) {
  //         product._id = Math.random().toString();
  //       }
  //       // always return the product
  //       return product;
  //     });
  //     // save the products asynchronously
  //     this.saveProductsAsIs(products);
  //   });
  // }
};
