const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

mongoose.Promise = global.Promise

const userSchema = mongoose.Schema({

    email: {type: String, unique:true, required: true},
    password: String,
    hash: {
    	hash: {type: String, required: true},
		created: {type: Date, default: Date.now()},
    	validated: {type: Date}
    },
	lastLogin: {type: String},
    roles: [{
        role: {type: String, default: "client"},
    	job_title: String,
		created: {type: Date, default: Date.now()},
		disabled: {type: Boolean}
    }],
    // isikuandmed
    personal_data: {
        nimi: String,
        tel_nr: Number,
        aadress: String,
        isikukood: Number,
        dok_nr: String,
        eraisik: Boolean,
        juriidiline_isik: Boolean,
        reg_nr: Number,
        kmk_nr: Number
    }

})

const userModel = mongoose.model('user',userSchema)

const login = (email, password)=>{
    return(userModel.findOne({ 
        'email': email, 
        'password': password, 
        'hash.validated':{ 
            $exists: true 
        }
    }))
}

const verify = hash => {return userModel.findOne({ 'hash.hash': hash })}

const validate = (password, confirmPassword, hash)=>{
/*    if(password === confirmPassword){*/
    	let conditions = { 'hash.hash':hash }, 
            update = {
                password: password,
                hash: { 
                    validated: Date.now() 
                }
            }
        return userModel.findOneAndUpdate(conditions, update, {new: true})
/*    } else {
        return new Error("Paroolid ei klapi!")
    }*/
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

const create = email=>{
	let hash = crypto.createHash('sha256').update(email).digest('hex')
    let user = new userModel({ 
        email: email, 
        hash: { 
            hash: hash, 
            created: Date.now()
        },
    })
    return user.save()
}

const forgot = (email, res)=>{
	let hash = crypto.createHash('sha256').update(email).digest('hex')
	let conditions = {email: email}, 
        update = { hash: { hash:hash, created: Date.now() }}

    userModel.findOneAndUpdate(conditions, update, {new: true})
        .then(user => {
            console.log(user)
            if (!user) { return Promise.reject('Ei leidnud kasutajat!') }
        })
        .then(()=>{
                sendMagicLink(email, hash)
                return res.json({
                    status: "accept",
                    data: {
                        msg: "Valideerimislink saadeti emailile!"
                    }
                })
        })
        
        .catch(err => {
            console.log(err)
                return res.json({
                    status: "reject",
                    data: {
                        msg: "Midagi läks valesti... :("
                    }
                })
        })
}

module.exports = {
	userModel,
	login,
	verify,
	validate,
	create,
	forgot,
    sendMagicLink
}

