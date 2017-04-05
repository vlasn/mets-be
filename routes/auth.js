const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mets');
const db = mongoose.connection;//active database
const userModel = require('./../models/userModel.js');
db.on('error', console.error.bind(console,'connection:error'));
db.once('open', ()=>{
    console.log('MongoDB successfully connected');
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); 

router.post("/",(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    userModel.find({ 'email': email, 'password': password }, function (err, docs) {
        if(docs.length !== 1 || docs[0].email != email || docs[0].password != password){
            res.json({
                status: "failure",
                data: {
                    msg: "Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!"
                }
            });
        } else if(docs[0].email === email && docs[0].password === password){
            res.json({
                status: "accept",
                data: {
                    msg: "Oled edukalt sisse logitud"
                }
            })
        }
    });
});

module.exports = router;