const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
const crypto = require('crypto');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({

    email: {type: String, required: true},
    password: String,
    hash: {
    	hash: {type: String, required: 'vajalik väli'},
		created: {type: Date, default: Date.now()},
    	validated: {type: Date}
    },
	lastLogin: {type: String},
    roles: [{ 
    	title: {type: String, required: true},
		created: {type: Date, default: Date.now()},
		disabled: {type: Boolean}
    }]
})

const userModel = mongoose.model('user',userSchema)

const login = (email, password, res)=>{
	// kas validated väli eksisteerib (aka kas kasutaja on valideeritud) ning ühtegi rolli pole disabled
    userModel.findOne({ 'email': email, 'password': password, 'hash.validated':{ $exists:true }}) 
        .then(foundUserDoc => {

            if (!foundUserDoc) { return Promise.reject('Sellise parooli ja emaili kombinatsiooniga valideeritud kasutajat ei eksisteeri!') }
            console.log(email + " logis sisse " + new Date().toLocaleString())
            res.json({
                status: "accept",
                data: {
                    msg: "Oled edukalt sisse logitud"
                }
            })
        })
       .catch(err => {
            console.log(err)
            return res.status(403).send("Sellise parooli ja emaili kombinatsiooniga valideeritud kasutajat ei eksisteeri!")
        })
}

const verify = (hash, res)=>{
    userModel.findOne({ 'hash.hash': hash })
    .then(user => {
        if (!user) { return Promise.reject('ei leidnud kasutajat'); }
        console.log("found user with email: " + user.email)
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
}

const validate = (email, password, hash, res)=>{
	let conditions = {email: email, 'hash.hash':hash}, 
        update = {password: password, hash: { validated: Date.now() }}
    userModel.findOneAndUpdate(conditions, update, {new: true})
        .then((user, veelmidagi, ops) => {

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
}

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

const create = (email, role, res)=>{
	let hash = crypto.createHash('sha256').update(email).digest('hex')
    let user = new userModel({ 
        email: email, 
        hash: { 
            hash: hash, 
            created: Date.now()
        },
        roles: [{
            title: role, 
            created: Date.now()
        }] 
    })
    user.save()
        /* .catch(err) won't catch mongoose errors, however, passing the err argument along the 
        second callback function (which in turn needed to be added) for .then solved the problem

        .then((doc)=>{if(doc){return Promise.reject('Sellise parooli ja emaili kombinatsiooniga valideeritud kasutajat ei eksisteeri!')}},)
            .then(() => sendMagicLink(email, hash))
                .then(doc => console.log(doc), res.json("emailile saadeti üks maagiline link"))
        .catch(err => {
            console.log(err)
            return res.status(403).send("midagi läks valesti")
        })*/
        .then((doc)=>{
            if(doc){
                sendMagicLink(email, hash)
                res.json("emailile saadeti üks maagiline link")
            }
        },
        (err)=>{
            res.json(err)
        })
}

const forgot = (email, res)=>{
	let hash = crypto.createHash('sha256').update(email).digest('hex')
	let conditions = {email: email}, 
        update = { hash: { hash:hash, created: Date.now() }}

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
}



module.exports = {
	userModel,
	login,
	verify,
	validate,
	create,
	forgot
}

