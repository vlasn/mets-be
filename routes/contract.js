const express = require('express')
router = express.Router(),
multer = require('multer'),
bodyParser = require('body-parser'),
contractModel = require('./../models/contractModel.js'),
userModel = require('./../models/userModel.js'),
helper = require('./helper.js'),
responseFactory = helper.responseFactory,
path = require('path'),
fs = require('fs'),
fnames = {},
loc = path.resolve(__dirname, `../uploaded_files/`),
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, loc)
  },
  filename: function (req, file, cb) {
    let name = file.originalname.split('.').shift()
    let ext = "." + file.originalname.split('.').pop()
    let fname = name + '_' + Date.now() + ext
    fnames[file.fieldname] = fname
    cb(null, fname)
  }
}),
upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.pdf') return cb(new Error('Only pdfs are allowed'))
    cb(null, true)
  }
}).fields([{ name: 'leping', maxCount: 1 }, { name: 'metsateatis', maxCount: 1 }])

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))

router.post("/create",(req, res)=>{
console.log(req.body)
  upload(req, res, function (err) {
    if (err) {res.status(500).json(responseFactory("reject", err))}

    //TODO - more robust find function
    let findby = req.body.email
    if(typeof(findby)!=="string") findby=findby[0]
    req.body.documents = {}
    req.body.documents.leping = fnames.leping
    req.body.documents.metsateatis = fnames.metsateatis
    userModel.findByEmail(findby)
    .then(foundEmail=>{
      if(!foundEmail){return Promise.reject("Sellise emailiga klienti ei leitud!")}
      contractModel.create(req.body)
      .then((createdContract)=>{
        if(createdContract){res.status(200).json(responseFactory("accept","Leping loodud!"))}
      },
      err=>{
        for(filename in fnames) fs.unlink(loc+'/'+fnames[filename], (err)=>{console.log(err)})
        fnames = []
        res.status(500).json(responseFactory("reject", err))
      })
    })
    .catch(err=>{
      for(filename in fnames) fs.unlink(loc+'/'+fnames[filename], (err)=>{console.log(err)})
      fnames = []
      res.status(500).json(responseFactory("reject", err))
    })
  })
})

// returns all contracts related to given email
router.post("/fetchAll",(req, res)=>{
  contractModel.fetchAllClientRelated(req.body.email)
  .then(docs => {
    if (!docs) {return Promise.reject('Ei leidnud lepinguid!')}
    res.status(200).json(responseFactory("accept", "The documents as per requested, my good sir", docs))
  })
  .catch(err => res.status(500).json(responseFactory("reject", err)))
})

router.get("/fetch", (req, res)=>{
  let cadastre = req.query.cadastre //search term
  let metsameister = req.query.metsameister //person
  let status = req.query.status //status
  contractModel.fetch(cadastre, metsameister, status)
  .then(docs=>{
    if(!docs || docs === null) {return Promise.reject('Ei leidnud selliseid lepinguid!')}
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