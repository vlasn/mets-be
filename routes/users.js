const router = require('express').Router()
      bodyParser = require('body-parser')
      userModel = require('./../models/user.js')
      helper = require('./helper.js')
      responseFactory = helper.responseFactory

router.use(bodyParser.json())

router.route('/')
.post((req, res)=> {
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
.get((req, res)=>{
  // api/users?q=peeter GET
  let q = req.query.q || ''
  userModel.findUser(q)
  .then(doc=>{
    res.status(200).json(responseFactory("accept", "Ole lahke", doc))
  })
  .catch(console.log)
})

module.exports = router