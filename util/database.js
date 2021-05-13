const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// the underscore is a convention to signal this var is only used intenrally
// in this file
let _db; 

const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://benjihansen:cammyc-ziptyb-rIhvo7@cluster0.unnmq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    )
        .then(client => {
            console.log("Connected!");
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
        });

}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

