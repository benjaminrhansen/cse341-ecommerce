const fs = require("fs");
const path = require('path');

const rootDir = require(path.join("..", "util", "path"));

const p = path.join(rootDir, "data", "products.json")

const getProductsFromFile = callback => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return callback([]);
        }
        // debugging
        //console.log("Parsing", fileContent);
        callback(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        getProductsFromFile(products => {
            // must use arrow functions for this to be in context
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if (err) {
                    throw err;
                }
                // else
                console.log("Saving products");
            });
        });
    }

    // method calls are done from the class
    // definition itself and not an instantiation
    // of the object
    static fetchAll(callback) {
        getProductsFromFile(callback);
    }
}