const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mets');
const db = mongoose.connection;
const userModel = require('./../models/users.js');

db.on('error', console.error.bind(console,'connection:error'));
db.once('open', function () {
    console.log('Mngodb edukalt ühendatud');
});

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); 

router.get('/dog', (req, res)=>{
    res.json({
        username: "dog",
        age: "3",
        greetings: {
            happy: "woof",
            angry: "bark",
            sad: "howl"
        }
    });
});

router.post("/",(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    userModel.find({ 'email': email, 'password': password }, function (err, docs) {
        console.log(docs);
        if(err){
            res.send(err);

        }
        console.log(docs[0].email, email);
        console.log(docs[0].password, password);
        if(docs[0].email === email && docs[0].password === password){
            res.send('Oled sisse logitud');
        }
    });
});

router.get('/', (req,res)=>{
    res.json("Please define username")
});

module.exports = router;