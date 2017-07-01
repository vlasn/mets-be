const router = require('express').Router()
      bodyParser = require('body-parser')
      jwt = require('jsonwebtoken')
      secret = process.env.SECRET
      userModel = require('./../../models/userModel.js')
      newToken = require('./token').create

router.use(bodyParser.json())

router.route('/')
	.post((req, res)=>{
		console.log(req.body)
		userModel.login(req.body.email, req.body.password)
		.then(user => {
	    if (!user) {return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!')}
	    console.log(user.email + " logis sisse @ " + new Date().toLocaleString())
	  	let data = {
	      user_id: user._id,
	  		lastLogin: user.lastLogin,
	  		roles: user.roles,
	  		personal_data: user.personal_data,
	      token: newToken({userId: user._id})
	  	}
	  	userModel.lastLogin(user.email)
	    res.status(200).json(responseFactory("accept","Oled sisse logitud!", data))
	  })
	  .catch(err => {
	    console.log(err)
	    res.status(500).json(responseFactory("reject", err))
		})
	})
	.get((req, res)=>{
		//verify hash
	})

module.exports = router