const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
userModel = require('./../models/userModel.js'),
contractModel = require('./../models/contractModel.js'),
masterPricelistModel = require('./../models/masterPricelistModel.js')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

/*router.post("/login",(req, res)=> {
	userModel.login(req.body.email, req.body.password)
		.then(foundUserDoc => {
			console.log(foundUserDoc)
            if (!foundUserDoc) { return Promise.reject('Sellise parooli ja emaili kombinatsiooniga kasutajat ei eksisteeri!') }
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

// hash verification - determining if the given hash is associated with an user document
router.get("/verify/:hash",(req, res)=> {
	userModel.verify(req.params.hash)
	    .then(foundUserDoc => {
	        if (!foundUserDoc) { return Promise.reject('ei leidnud kasutajat'); }
	        console.log("found user with email: " + foundUserDoc.email)
	        return res.json(responseFactory("accept",foundUserDoc.email))
    	})
	    .catch(err => {
	        console.log(err)
	        return res.json(responseFactory("reject","Midagi läks valesti... :("))
	    })
})

// user will be validated on successful hash exchange
router.post("/validate",(req, res)=> {
	let rb = req.body
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
						        if (!returnedUserDoc) { return Promise.reject('Ei leidnud kasutajat!') }
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
		.catch(err => console.log(err))
})

router.post("/create",(req, res)=> {
	userModel.create(req.body.email)
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

// 
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
})*/

// creates a new contract
router.post("/contract/create",(req, res)=>{
	//console.log(req.body)
	contractModel.create(
		req.body.email,
		req.body.metsameister,
		req.body.documents,
		req.body.hinnatabel,
		req.body.contract_creator, res)
})

// returns all contracts related to user email
router.post("/contract/fetch",(req, res)=>{
	contractModel.fetchAllClientRelated(req.body.email)
		.then(docs => {
			if (!docs) {return Promise.reject('Ei leidnud lepinguid!')}
			console.log(docs)
		})
		.catch(err => {
			console.log(err)
		})
})

// add rows to master_pricelist
router.post("/master_pricelist/add",(req, res)=>{
	masterPricelistModel.insert(req.body)
		.then(docs => {
			console.log("Sisestati " + docs.length + " rida")
			res.json(responseFactory("accept","Sisestati " + docs.length + " rida"))
		})
		.catch(err => {
			console.log("Veateade:",err)
			res.json(responseFactory("reject","Midagi läks valesti... :("))
		})
})

const responseFactory = (status, msg, data)=>{
	return {
		status: status,
		msg: msg,
		data: data
	}
}

module.exports = {router,responseFactory}