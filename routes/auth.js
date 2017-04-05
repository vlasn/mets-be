const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userModel = require('./../models/userModel.js');

mongoose.Promise = global.Promise;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); 

router.post("/",(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;

    userModel.find({ 'email': email, 'password': password })
        .then(docs => {
            console.log(docs);
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
        })
    .catch(e => console.log(e));

});


module.exports = router;