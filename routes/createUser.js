const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
mongoose.Promise = global.Promise;
const userModel = require('./../models/userModel.js');



router.post("/",(req, res)=>{
    let email = "ajutemail";
    let hash = crypto.createHash('sha256').update(email+Date.now()).digest('hex');
    console.log(hash);

    let user = new userModel({ 'email': email, 'hash': hash });

    user.save()
        .then(doc => console.log(doc), res.json("salvestatud"))
        .catch(err => console.log(err))
});

router.get("/:hash",(req, res) => {
    let hash = req.params.hash;
    
    userModel.find({ 'hash': hash }, function (err, docs) {
        if (docs[0]) {}
    }); 
    
});

// hiljem läheb dotenvi
/*let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'metsahaldur.test@gmail.com',
        pass: 'Tug3v!"#'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Metsahaldur Test 👻" <metsahaldur.test@gmail.com>', // sender address
    to: 'gnesselmann@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});*/

module.exports = router;