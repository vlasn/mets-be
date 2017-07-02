const router = require('express').Router()
      bodyParser = require('body-parser')
      jwt = require('jsonwebtoken')
      secret = process.env.SECRET
      user = require('./../../models/user.js')
      newToken = require('./token').create
      responseFactory = require('../helper.js').responseFactory
      checkPrivileges = require('./token').checkPrivileges

router.use(bodyParser.json())

router.route('/')
.post((req, res) => {
	console.log(req.body)
	user.login(req.body.email, req.body.password)
	.then(userDoc => {
    if (!userDoc) {return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!')}
    console.log(userDoc.email + " logis sisse @ " + new Date().toLocaleString())
  	let data = {
      user_id: userDoc._id,
  		lastLogin: userDoc.lastLogin,
  		roles: userDoc.roles,
  		personal_data: userDoc.personal_data,
      token: newToken({userId: userDoc._id, email: userDoc.email, roles: userDoc.roles})
  	}
  	user.lastSuccessfulLogin(userDoc.email)
    res.status(200).json(responseFactory("accept","Oled sisse logitud!", data))
  })
  .catch(err => {
    console.log(err)
    res.status(500).json(responseFactory("reject", err))
	})
})
.get((req, res) => {
	user.verify(req.params.hash)
  .then(userDoc => {
    if (!userDoc) {return Promise.reject('Ei leidnud sellise räsiga kasutajat!')}
    res.status(200).json(responseFactory("accept", userDoc.email))
	})
  .catch(err => {
    console.log(err)
    res.status(500).json(responseFactory("reject","Midagi läks valesti... :("))
  })
})
.put((req, res) => {
	user.forgotPassword(req.body.email)
  .then(userDoc => {
    //console.log(user)
    if (!userDoc) {return Promise.reject('Ei leidnud kasutajat!')}
    res.status(200).json(responseFactory("accept","Valideerimislink saadeti emailile!"))
  })
  .catch(err => {
    console.log(err)
    res.status(500).json(responseFactory("reject","Midagi läks valesti... :("))
  })
})
.patch((req, res) => {
	let rb = req.body
	if (!rb.hash || !rb.password) return Promise.reject('Räsi ja paroolid puudu!')
	if (!rb.hash || rb.hash.length !== 64) return Promise.reject('Räsi on vigane!')
	if (rb.password !== rb.cpassword) return Promise.reject('Paroolid ei klapi!')
	user.verifyHash(req.body.hash)
	.then(userDoc => {
		if (!userDoc) return Promise.reject('Säärast kasutajat ei eksisteeri!')
		let c = userDoc.hash.created.getTime()
				d = Date.now()
				dif = d - c
		if (dif >= 86400000){return Promise.reject("reject", "Valideerimislink on aegunud!")}
		user.validate(rb.password, rb.hash)
    .then(userDoc => {
      if (!userDoc) {return Promise.reject('Ei leidnud kasutajat!')}
      res.status(200).json(responseFactory("accept","Kasutaja valideeritud! (logi sisse nupp vms)"))
    })				
	})
	.catch(err => {
		console.log(err)
		return res.status(400).json(responseFactory("reject", err))
	})
})

module.exports = router