const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
userModel = require('./../models/userModel.js'),
helper = require('./helper.js'),
responseFactory = helper.responseFactory

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.post("/login",(req, res)=> {
	userModel.login(req.body.email, req.body.password)
	.then(foundUserDoc => {
		//console.log(foundUserDoc)
    if (!foundUserDoc) {return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!')}
    console.log(foundUserDoc.email + " logis sisse " + new Date().toLocaleString())
  	let data = {
      user_id: foundUserDoc._id,
  		lastLogin: foundUserDoc.lastLogin,
  		roles: foundUserDoc.roles,
  		personal_data: foundUserDoc.personal_data
  	}
  	userModel.lastLogin(foundUserDoc.email)
    return res.json(responseFactory("accept","Oled sisse logitud!", data))
  })
  .catch(err => {
    console.log(err)
    return res.json(responseFactory("reject", err))
	})
})

router.post("/create",(req, res)=> {
	userModel.create(req.body)
  .then((doc)=>{
    if(doc){
      userModel.sendMagicLink(doc.email, doc.hash.hash)
      return res.json(responseFactory("accept","Valideerimislink saadeti emailile!"))
    }
  },
  (err)=>{
  	console.log(err)
  	return res.json(responseFactory("reject","Midagi läks valesti... :("))
  })
})

router.get("/verify/:hash",(req, res)=> {
	userModel.verify(req.params.hash)
  .then(foundUserDoc => {
    if (!foundUserDoc) {return Promise.reject('Ei leidnud kasutajat!')}
    console.log("Found user with email: ", foundUserDoc.email)
    return res.json(responseFactory("accept", foundUserDoc.email))
	})
  .catch(err => {
    console.log(err)
    return res.json(responseFactory("reject","Midagi läks valesti... :("))
  })
})

router.post("/validate",(req, res)=> {
	let rb = req.body
	if(!rb.hash || !rb.password) {return res.json(responseFactory("reject","Midagi läks valesti... :("))}
	userModel.verify(req.body.hash)
	.then(foundUser => {
		if(foundUser){
			let created = foundUser.hash.created.getTime()
			let d = Date.now()
			let difference = d - created
			if(difference >= 86400000){
				return res.json(responseFactory("reject","Valideerimislink on aegunud!"))
			} else if(difference < 86400000){
				if(rb.hash && rb.hash.length == 64){
					if(rb.password === rb.cpassword){
						userModel.validate(rb.password, rb.cpassword, rb.hash)
			      .then(returnedUserDoc => {
			        if (!returnedUserDoc) {return Promise.reject('Ei leidnud kasutajat!')}
			        return res.json(responseFactory("accept","Kasutaja valideeritud! (logi sisse nupp vms)"))
				    })
				    .catch(err => {
			        console.log(err)
			        return res.json(responseFactory("reject","Midagi läks valesti... :("))
				    })
					} else {return res.json(responseFactory("reject","Paroolid ei klapi!"))}
				} else {return res.json(responseFactory("reject","Räsi on vigane!"))}					
			}
		} else {
			return res.json(responseFactory("reject","Midagi läks valesti... :("))
		}
	})
	.catch(err => {
		console.log(err)
		return res.json(responseFactory("reject","Midagi läks valesti... :("))
	})
})

router.post("/finduser", (req, res)=>{
  userModel.findUser(req.body.q)
  .then(doc=>{
    res.json(responseFactory("accept", "Ole lahke", doc))
  })
  .catch(console.log)
})

router.post("/forgot",(req, res)=> {
	userModel.forgot(req.body.email)
  .then(user => {
    //console.log(user)
    if (!user) {return Promise.reject('Ei leidnud kasutajat!')}
    return res.json(responseFactory("accept","Valideerimislink saadeti emailile!"))
  })
  .catch(err => {
    console.log(err)
    return res.json(responseFactory("reject","Midagi läks valesti... :("))
  })
})


module.exports = {
	router
}