const express = require('express');
const fs = require('fs')
const path = require('path')
var {
    List,
    ListItem
} = require('./list'); // Import our List and ListItem classes from list.js

// Create an express router 
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;

var token = fs.readFileSync(path.join(process.cwd(),".env"))
var url = `mongodb://reminderapi-service:${token}@reminderapi-acc-shard-00-00-qavww.gcp.mongodb.net:27017,reminderapi-acc-shard-00-01-qavww.gcp.mongodb.net:27017,reminderapi-acc-shard-00-02-qavww.gcp.mongodb.net:27017/test?ssl=true&replicaSet=reminderapi-acc-shard-0&authSource=admin&retryWrites=true`
var collection

MongoClient.connect(url).then(function(client) {
    collection = client.db("reminderapi").collection("lists");
});

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend.html');
});

// Returns a list of all of our lists
router.get('/lists', (req, res) => {
    collection.find().toArray(function(err, results) {
        res.json(results)
    })
});

// Adds a list
router.post('/lists', (req, res) => {
    let body = req.body;
    let listId = body.id;
    let listName = body.name;
    let newList = new List(listId, listName);
    collection.insertOne(newList, function(err, res) {
        if (err) throw err;
    })
    res.send(`${listId}: ${listName}`);
});

// Returns the list information in the specified list
router.get('/lists/:id', (req, res) => {
    let listId = req.params.id;
    collection.find({
        id: listId
    }).toArray(function(err, results) {
        if (err) throw err;
        res.json(results)
    })
});

// Adds an item to the specified list
router.post('/lists/:id', (req, res) => {
    let body = req.body;
    let listId = req.params.id;

    let listItem = new ListItem(body.id, body.name, body.description);
    var query = {
        id: listId
    }
    var values = {
        $push: {
            "items": listItem
        }
    }
    collection.updateOne(query, values, function(err, res) {
        if (err) throw err;
    })
    res.send('Got it');
    return;


});

module.exports = router;