const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
mongoose.Promise = global.Promise;
const userModel = require('./../models/userModel.js');

router.post("/",(req, res) => {
    let action = req.body.action
    let email = req.body.email
    let hash = crypto.createHash('sha256').update(email).digest('hex')
    switch(action){
        case "create":
            let role = req.body.role
            let user = new userModel({ 
                email: email, 
                hash: { 
                    hash: hash, 
                    created: Date.now()
                },
                roles: [{title: role}] 
            })
            user.save()
                .then(doc => console.log(doc), res.json("emailile saadeti üks maagiline link"))
                    .then(() => sendMagicLink(email, hash))
                .catch(err => console.log(err))
            break
        case "forgot":
            let conditions = {email: req.body.email}, 
                update = { hash: { hash:hash, created: Date.now()   }}

            userModel.findOneAndUpdate(conditions, update, {new: true})
                .then(user => {
                    console.log(user)
                    if (!user) { return Promise.reject('ei leidnud kasutajat/juba valideeritud') }
                })
                .then(()=>{
                        sendMagicLink(email, hash)
                        return res.json({
                            status: "accept",
                            data: {
                                msg: "link saadeti emailile"
                            }
                        })
                })
                
                .catch(err => {
                    console.log(err)
                    return res.status(403).send("midagi läks valesti")
                })
            break
        default:
            return res.send("action type unspecified")   
    }

    // kontrollida, kas sisselogitud kasutajal on õigus seda rolli luua
    // if(req.body.sisselogitudkasutaja.roles )

    // NB! kui hash.created ja Date.now() vahe ületab 24h siis peab see hash ära aeguma !!!

    /*
    let role = req.body.role;
    
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


});

router.get("/:hash",(req, res) => {
    let hash = req.params.hash
    
    userModel.findOne({ 'hash': hash })
        .then(user => {

            if (!user) { return Promise.reject('ei leidnud kasutajat'); }

            console.log("found user with email", user.email)
            return res.json({
                status: "accept",
                data: {
                    email: user.email
                }
            });

        })
        .catch(err => {
            console.log(err)
            return res.status(403).send("ei leidnud kasutajat")
        })
});

router.post("/pass", (req, res) => {
    let email = req.body.email
    let password = req.body.password
    let hash = req.body.hash.hash
    console.log(req.body)
    // validated välja eksistents === kasutaja on valideeritud, hashi kaotame ära
    let conditions = {email: email, 'hash.hash':hash}, 
        update = {password: password, hash: { validated: Date.now() }}
    console.log(conditions)
    userModel.findOneAndUpdate(conditions, update, {new: true})
        .then(user => {
            console.log(user)
            if (!user) { return Promise.reject('ei leidnud kasutajat/juba valideeritud') }

            return res.json({
                status: "accept",
                data: {
                    msg: "parool on muudetud!"
                }
            }) 
        })
        .catch(err => {
            console.log(err)
            return res.status(403).send("midagi läks valesti/juba valideeritud")
        })
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