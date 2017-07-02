const router = require('express').Router()
      bodyParser = require('body-parser')
      user = require('./../models/user.js')
      helper = require('./helper.js')
      responseFactory = helper.responseFactory

router.use(bodyParser.json())

router.route('/')
.post((req, res)=> {
	user.create(req.body)
  .then(userCreated=>{
    if (!userCreated) {throw new Error('Kasutajat ei loodud mingil põhjusel :|')}
    user.sendMagicLink(userCreated.email, userCreated.hash.hash) &&
    res.status(200).json(responseFactory('accept', `Valideerimislink saadeti emailile ${doc.email}`))
    throw new Error('Kasutajat ei loodud mingil põhjusel :|')
  },
  err=>{
  	console.log(err)
  	res.status(500).json(responseFactory('reject', 'Midagi läks metsa :|'))
  })
})
.get((req, res)=>{
  // api/users?q=peeter GET
  let q = req.query.q || ''
  user.findUser(q)
  .then(userDoc=>{
    res.status(200).json(responseFactory('accept', '', userDoc))
  })
})

module.exports = router