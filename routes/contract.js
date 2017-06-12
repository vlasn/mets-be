const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
contractModel = require('./../models/contractModel.js'),
userModel = require('./../models/userModel.js'),
helper = require('./helper.js'),
responseFactory = helper.responseFactory

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

// if a client with given email exists, a contract will be created
router.post("/create",(req, res)=>{
  userModel.findByEmail(req.body.email)
  .then(foundEmail=>{
    if(!foundEmail){return Promise.reject("Sellise emailiga klienti ei leitud!")}
    contractModel.create(req.body)
    .then((createdContract)=>{
      if(createdContract){return res.json(responseFactory("accept","Leping loodud!"))}
    },
    (err)=>{
      return res.json(responseFactory("reject", err))
    })
  })
  .catch(err=>{
    res.json(responseFactory("reject", err))
  })
})

// returns all contracts related to given email
router.post("/fetch",(req, res)=>{
  contractModel.fetchAllClientRelated(req.body.email)
  .then(docs => {
    if (!docs) {return Promise.reject('Ei leidnud lepinguid!')}
    res.json(responseFactory("accept", "The documents as per requested, my good sir", docs))
  })
  .catch(err => {
    res.json(responseFactory("reject", err))
  })
})

module.exports={router}