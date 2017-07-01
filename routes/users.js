const router = require('express').Router()
      bodyParser = require('body-parser')
      userModel = require('./../models/user.js')
      helper = require('./helper.js')
      responseFactory = helper.responseFactory

router.use(bodyParser.json())

router.post("/create",(req, res)=> {
	userModel.create(req.body)
  .then(doc=>{
    if(doc){
      userModel.sendMagicLink(doc.email, doc.hash.hash)
      res.status(200).json(responseFactory("accept","Valideerimislink saadeti emailile!"))
    }
  },
  err=>{
  	console.log(err)
  	res.status(500).json(responseFactory("reject","Midagi läks valesti... :("))
  })
})

router.post("/finduser", (req, res)=>{
  userModel.findUser(req.body.q)
  .then(doc=>{
    res.status(200).json(responseFactory("accept", "Ole lahke", doc))
  })
  .catch(console.log)
})

router.post("/forgot",(req, res)=> {
	userModel.forgot(req.body.email)
  .then(user => {
    //console.log(user)
    if (!user) {return Promise.reject('Ei leidnud kasutajat!')}
    res.status(200).json(responseFactory("accept","Valideerimislink saadeti emailile!"))
  })
  .catch(err => {
    console.log(err)
    res.status(500).json(responseFactory("reject","Midagi läks valesti... :("))
  })
})


module.exports = router