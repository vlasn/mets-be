const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
contractModel = require('./../models/contractModel.js'),
helper = require('./helper.js'),
responseFactory = helper.responseFactory

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.post("/create",(req, res)=>{
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


module.exports = {
	router
}