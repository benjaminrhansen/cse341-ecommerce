const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            const parsedCart = err ? {} : JSON.parse(fileContent);
            console.log("Parsed cart:", parsedCart);
            // if there isn't an error and the parsedCart is defined, then assign it to the parsed cart
            // else, create a default cart
            let cart = (!err && parsedCart && parsedCart != {}) ? parsedCart : {products: [], totalPrice: 0};
            if (err) {
                console.log("ERROR", err);
            }
            // Analyze the cart => Find existing product
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1; 
                // avoid synchronization errors by making a new object
                cart.products = [...cart.products]; 
                cart.products[existingProductIndex] = updatedProduct;

            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            // the plus before the productPrice converts it to a number
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        })
        // Add new product/increase quantity
    }
    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            if (!product) return;
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id );
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
            
            // write the cart back to the file at the end
            fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                console.log(err);
            });
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                cb(null);
            } else {
                cb(cart);
            }
        })
    }
}