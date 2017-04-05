const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
mongoose.Promise = global.Promise;
const userModel = require('./../models/userModel.js');



router.post("/",(req, res)=>{
    let email = "gnesselmann@gmail.com";
    let hash = crypto.createHash('sha256').update(email+Date.now()).digest('hex');
    console.log(hash);

    let user = new userModel({ 'email': email, 'hash': hash });

    user.save()
        .then(doc => console.log(doc), res.json("salvestatud"))
        .then(() => sendMagicLink(email, hash))
        .catch(err => console.log(err))
});

router.get("/:hash",(req, res) => {
    let hash = req.params.hash;
    
    userModel.find({ 'hash': hash })
        .then(docs => {
            if (docs[0].hash === hash) {
                console.log("found user with email", docs[0].email);
                res.json({
                    vastus: "found user with email"
                });
            }
        })
        .catch(err => console.log(err))
});

const sendMagicLink = (email, hash) => {
    // hiljem läheb dotenvi
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'metsahaldur.test@gmail.com',
            pass: 'Tug3v!"#'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Metsahaldur Test 👻" <metsahaldur.test@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world ?', // plain text body
        html: `<a href="http://localhost:3000/api/auth/create/${hash}">Magic</a>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

module.exports = router;