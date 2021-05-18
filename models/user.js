//const getDb = require('../util/database').getDb;

//const mongodb = require('mongodb');
//const ObjectId = mongodb.ObjectID;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            product: {
                type: Schema.Types.ObjectId, // the type to store a reference to a product
                ref: 'Product', // relation to the Product model
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function(product) {
    // this refers to the schema
    const cartProductIndex = this.cart ? this.cart.items.findIndex(cp => {
        console.log("What is this cp product id?: ", cp.product);
        return cp.product.toString() === product._id.toString();
    }) : null;
    console.log("Product of Cart Index:", cartProductIndex);
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            product: product._id, // will be store as an ObjectId already
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();
    // const db = getDb();
    // // will always override the past cart, not update
    // return db.collection('users').updateOne(
    //     { _id: new ObjectId(this._id) },
    //     { $set: { cart: updatedCart } }
    // );
}

userSchema.methods.removeFromCart = function(productId) {
    console.log("Deleting product:", productId);
    const updatedCartItems = this.cart.items.filter(item => {
        // each item has a product ID named product
        // it's a relation
        return item.product.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

/*
// move
// module.exports = class Cart {
//     static addProduct(id, productPrice) {
//         // Fetch the previous cart
//         fs.readFile(p, (err, fileContent) => {
//             const parsedCart = err ? {} : JSON.parse(fileContent);
//             console.log("Parsed cart:", parsedCart);
//             // if there isn't an error and the parsedCart is defined, then assign it to the parsed cart
//             // else, create a default cart
//             let cart = (!err && parsedCart && parsedCart != {}) ? parsedCart : {products: [], totalPrice: 0};
//             if (err) {
//                 console.log("ERROR", err);
//             }
//             // Analyze the cart => Find existing product
//             const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
//             const existingProduct = cart.products[existingProductIndex];
//             let updatedProduct;
//             if (existingProduct) {
//                 updatedProduct = { ...existingProduct };
//                 updatedProduct.qty = updatedProduct.qty + 1; 
//                 // avoid synchronization errors by making a new object
//                 cart.products = [...cart.products]; 
//                 cart.products[existingProductIndex] = updatedProduct;

//             } else {
//                 updatedProduct = { id: id, qty: 1 };
//                 cart.products = [...cart.products, updatedProduct];
//             }
//             // the plus before the productPrice converts it to a number
//             cart.totalPrice = cart.totalPrice + +productPrice;
//             fs.writeFile(p, JSON.stringify(cart), (err) => {
//                 console.log(err);
//             });
//         })
//         // Add new product/increase quantity
//     }
//     static deleteProduct(id, productPrice) {
//         fs.readFile(p, (err, fileContent) => {
//             if (err) {
//                 return;
//             }
//             const updatedCart = { ...JSON.parse(fileContent) };
//             const product = updatedCart.products.find(prod => prod.id === id);
//             if (!product) return;
//             const productQty = product.qty;
//             updatedCart.products = updatedCart.products.filter(prod => prod.id !== id );
//             updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            
//             // write the cart back to the file at the end
//             fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//                 console.log(err);
//             });
//         });
//     }

//     static getCart(cb) {
//         fs.readFile(p, (err, fileContent) => {
//             const cart = JSON.parse(fileContent);
//             if (err) {
//                 cb(null);
//             } else {
//                 cb(cart);
//             }
//         })
//     }
// }
*/

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart ? this.cart.items.findIndex(cp => {
//             console.log("What is this cp productId?: ", cp.productId);
//             return cp.productId.toString() === product._id.toString();
//         }) : null;
//         console.log("Product of Cart Index:", cartProductIndex);
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({ 
//                 productId: new mongodb.ObjectId(product._id),
//                 quantity: newQuantity
//             });
//         }
//         const updatedCart = { 
//             items: updatedCartItems
//         };
//         const db = getDb();
//         // will always override the past cart, not update
//         return db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: updatedCart } }
//         );
//     } 

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         });
//         // $in is a MongoDB-specific operator, I think
//         // look up more query parameters!
//         return db.collection('products').find(
//             { _id: { $in: productIds } }
//         ).toArray()
//          .then(products => {
//              // "if we don't have a reference to a collection
//              // we need to merge them manually which we are doing here"... - from the tutorial
//              return products.map(product => {
//                  return {...product, quantity: this.cart.items.find(item => {
//                      return item.productId.toString() === product._id.toString();
//                  }).quantity
//                 };
//              });
//          })
//          .catch(err => console.log(err));
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }

//     createOrder() {
//         const db = getDb();
//         // extract a snapshot of the user's cart,
//         // as an embedded document, not a relation
//         return this.getCart()
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new ObjectId(this._id),
//                         name: this.name
//                     }
//                 };
//                 return db.collection('orders')
//                     .insertOne(order)
//             })
//             .then(result => {
//                 this.cart = { items: [] }
//                 return db
//                     .collection('users')
//                     .updateOne(
//                         { _id: new ObjectId(this._id) },
//                         { $set: { cart: { items: [] } } }
//                     );
//             });
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new ObjectId(this._id)})
//             .toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({_id: new ObjectId(userId)})
//             .then(user => {
//                 console.log(user);
//                 return user;
//             })
//             .catch(err => console.log(err));
//     }
// }

// module.exports = User;