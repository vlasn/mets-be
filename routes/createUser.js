const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
mongoose.Promise = global.Promise;
const userModel = require('./../models/userModel.js');



router.post("/",(req, res) => {
    let email = "gnesselmann@gmail.com";
    let hash = crypto.createHash('sha256').update(email+Date.now()).digest('hex');
    console.log(hash);
    
  /*  let role = req.body.role;
    
    switch(role) {
    case "client":
        let pricelist = new pricelist({ })
        let user = new userModel({ 'email': email, 'hash': hash, 'role': role });
        break;
    case "employee":
        let user = new userModel({ 'email': email, 'hash': hash, 'role': role });
        break;
    default:
        return "midagi läks valesti."
    }
    */
    let user = new userModel({ 'email': email, 'hash': hash })

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
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'metsahaldur.test@gmail.com',
            pass: 'Tug3v!"#'
        }
    });

    let mailFieldOptions = {
        from: '"Metsahaldur Test 👻" <metsahaldur.test@gmail.com>',
        to: `${email}`,
        subject: 'Hello ✔',
        text: 'Hello world ?',
        html: `<a href="http://localhost:3000/api/auth/create/${hash}">Magic</a>`
    };


    mailTransporter.sendMail(mailFieldOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

module.exports = router;