const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const HOSTNAME= process.env.HOSTNAME
const EMAIL_LOGIN = process.env.EMAIL_LOGIN
const EMAIL_PASS = process.env.EMAIL_PASS
mongoose.Promise = global.Promise

const userSchema = mongoose.Schema({

    email: {type: String, unique:true, required: true},
    password: String,
    hash: {
    	hash: {type: String, required: true},
		created: {type: Date, default: Date.now()},
    	validated: {type: Date}
    },
	lastLogin: {type: Date},
    roles: [{
        role: {type: String, required: true},
		created: {type: Date, default: Date.now()},
		disabled: Boolean
    }],
    job_title: String,
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

const lastLogin = email=>{
    console.log("kutsuti")
    let conditions = {'email':email}, 
        update = {
            lastLogin: Date.now()
        }    
    userModel.findOneAndUpdate(conditions, update, ()=>{})
}

const verify = hash => {return userModel.findOne({ 'hash.hash': hash })}

const validate = (password, confirmPassword, hash)=>{
	let conditions = { 'hash.hash':hash }, 
        update = {
            password: password,
            hash: { 
                validated: Date.now() 
            }
        }
    return userModel.findOneAndUpdate(conditions, update, {new: true})
}

const sendMagicLink = (email, hash) => {
    // hiljem läheb dotenvi
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_LOGIN,
            pass: EMAIL_PASS
        }
    });

    let mailFieldOptions = {
        from: '"Metsahaldur Test 👻" <metsahaldur.test@gmail.com>',
        to: `${email}`,
        subject: 'Hello ✔',
        text: 'Hello world ?',
        html: `<a href="${HOSTNAME}/validate/${hash}">Magic</a>`
    };

    mailTransporter.sendMail(mailFieldOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

const create = email => {
	let hash = crypto.createHash('sha256').update(email).digest('hex')
    let user = new userModel({ 
        email: email, 
        hash: {
            hash: hash, 
            created: Date.now()
        },
        roles: [{role:"banana"}]
    })
    return user.save()
}

const forgot = email => {
	let hash = crypto.createHash('sha256').update(email).digest('hex')
	let conditions = {email: email}, 
        update = { hash: { hash:hash, created: Date.now() }}
    sendMagicLink(email, hash)
    return userModel.findOneAndUpdate(conditions, update, {new: true})
}

module.exports = {
	userModel,
	login,
	verify,
	validate,
	create,
	forgot,
    sendMagicLink,
    lastLogin
}

