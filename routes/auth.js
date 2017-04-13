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
    
    userModel.findOne({ 'email': email, 'password': password, 'roles.disabled': null }) 
        .then(foundUserDoc => {

            if (!foundUserDoc) { return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!'); }

            res.json({
                status: "accept",
                data: {
                    msg: "Oled edukalt sisse logitud"
                }
            })
        })
       .catch(err => {
            console.log(err)
            return res.status(403).send("Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!")
        })
        
});


module.exports = router;