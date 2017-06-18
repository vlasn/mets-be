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
      if(createdContract){res.status(200).json(responseFactory("accept","Leping loodud!"))}
    },
    err=>{
      res.status(500).json(responseFactory("reject", err))
    })
  })
  .catch(err=>{
    res.status(500).json(responseFactory("reject", err))
  })
})

// returns all contracts related to given email
router.post("/fetchAll",(req, res)=>{
  contractModel.fetchAllClientRelated(req.body.email)
  .then(docs => {
    if (!docs) {return Promise.reject('Ei leidnud lepinguid!')}
    res.status(200).json(responseFactory("accept", "The documents as per requested, my good sir", docs))
  })
  .catch(err => {
    res.status(500).json(responseFactory("reject", err))
  })
})

router.get("/fetch", (req, res)=>{
  let cadastre = req.query.cadastre //search term
  let metsameister = req.query.metsameister //person
  let status = req.query.status //status
  contractModel.fetch(cadastre, metsameister, status)
  .then(docs=>{
    if(!docs || docs === null){return Promise.reject('Ei leidnud selliseid lepinguid!')}
    res.status(200).json(responseFactory("accept", "The documents as per requested, my good sir", docs))
  })
  .catch(err=>res.status(500).json(responseFactory("reject", err)))
})

router.put("/update/:id", (req,res)=>{
  let id = req.params.id
  let key = req.body.key
  let value = req.body.value
  let remove = !!req.body.remove
  contractModel.updateContractLine(id,key,value, remove)
    .then(d => {
      if(!d || d===null) {
        console.log(`Couldn't find document ${id} to update.`)
        res.status(500).json(responseFactory('reject','Kirjet ei leitud!'))
      } else {
        console.log(`${key} of document ${id} is now ${value}`)
        res.status(200).json(responseFactory('accept','ok',d))
      }
    })
    .catch(e => {
      console.log(e)
      res.status(500).json(responseFactory('reject','okou',e))
    })
})

module.exports={router}