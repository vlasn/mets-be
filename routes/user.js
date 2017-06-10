const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
userModel = require('./../models/userModel.js'),
auth = require('./auth.js'),
responseFactory = auth.responseFactory

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.post("/login",(req, res)=> {
	userModel.login(req.body.email, req.body.password)
	.then(foundUserDoc => {
		//console.log(foundUserDoc)
    if (!foundUserDoc) {return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!')}
    console.log(foundUserDoc.email + " logis sisse " + new Date().toLocaleString())
  	let data = {
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
	userModel.create(req.body.email)
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