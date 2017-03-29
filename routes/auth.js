const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mets');
const db = mongoose.connection;
const userModel = require('./../models/users.js');
db.on('error', console.error.bind(console,'connection:error'));
db.once('open', function () {
    console.log('MongoDB successfully connected');
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); 

router.post("/",(req, res)=>{
    var email = req.body.email;
    var password = req.body.password;

    userModel.find({ 'email': email, 'password': password }, function (err, docs) {
        if(docs.length != 1){
            res.status(400).send('400: Faulty request');
        } else {
            if (docs[0].email != email || docs[0].password != password){
                res.send('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!');
            } else if(docs[0].email === email && docs[0].password === password){
                res.send('Oled edukalt sisse logitud!');
            }
        }
    });
});

router.get('/', (req,res)=>{
    res.status(400).send("400: Empty request")
});

module.exports = router;