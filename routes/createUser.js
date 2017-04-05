const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

router.post("/",(req, res)=>{
    let email = req.body.email;

    userModel.save({ 'email': email, 'password': password }, function (err, docs) {

    });
});

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
});

module.exports = router;