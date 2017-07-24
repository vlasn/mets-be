'use strict'

const router = require('express').Router(),
multer = require('multer'),
contract = require('./../models/contract.js'),
User = require('./../models/user.js'),
responseFactory = require('../util/response'),
path = require('path'),
fs = require('fs'),
fnames = [],
loc = path.resolve(__dirname, `../uploaded_files/`),
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, loc)
  },
  filename: function (req, file, cb) {
    let name = file.originalname.split('.').shift()
    let ext = "." + file.originalname.split('.').pop()
    let fname = name + '_' + Date.now() + ext
    fnames.push(fname)
    cb(null, fname)
  }
}),
upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.pdf') return cb(new Error('Only pdfs are allowed'))
    cb(null, true)
  }
}),
documentsUpload = upload.array('documents', 6)
//router.use(bodyParser.json())

router.route("/")
.post((req, res, next) => req.privileges > 1 ? next() : res.status(403).send('Insufficient privileges'),
documentsUpload, (req, res) => {
    if (Object.keys(req.files).length === 0 || req.files === undefined) return res.status(400).send('No files were attached')
    if (!req.body.email || !req.files) return res.status(400).send('Bad request')
    //TODO - more robust find function
    let findby = req.body.email
    if (typeof(findby) !== "string") findby = findby[0]

    req.body.documents = fnames
    console.log(req.body.documents)

    User.find(findby)
    .then(foundEmail => {
      if (!foundEmail) return Promise.reject('Sellise emailiga klienti ei leitud!')
      contract.create(req.body)
      .then((createdContract)=>{
        if (createdContract) res.status(200).json(responseFactory('accept', 'Leping loodud!'))
      },
      err=>{
        for(filename in fnames) fs.unlink(loc+'/'+fnames[filename], (err)=>{console.log(err)})
        fnames = []
        res.status(500).json(responseFactory('reject', err))
      })
    })
    .catch(err=>{
      for(filename in fnames) fs.unlink(loc+'/'+fnames[filename], (err)=>{console.log(err)})
      fnames = []
      res.status(500).json(responseFactory('reject', err))
    })

})
.get((req, res, next) => {
  req.privileges > 1 ? next() :
  contract.fetchAllClientRelated(req.user)
  .then(docs => {
    res.status(200).json(responseFactory('accept', '', docs))
  })
  .catch(e => res.status(400).send(e))
},
  (req, res) => {
    let cadastre = req.query.cadastre || ''//search term
    let metsameister = req.query.metsameister || '' //person
    let status = req.query.status || '' //status
    contract.fetch(cadastre, metsameister, status)
    .then(docs=>{
      if(!docs || docs === null) return Promise.reject('Ei leidnud selliseid lepinguid!')
      res.status(200).json(responseFactory('accept', '', docs))
    })
    .catch(err => res.status(500).json(responseFactory('reject', err)))
})
router.route("/:id").put((req,res)=>{
  let id = req.params.id
  let key = req.body.key
  let value = req.body.value
  let remove = !!req.body.remove
  contract.updateContractLine(id, key, value, remove)
  .then(d => {
    if(!d || d === null) {
      console.log(`Couldn't find document ${id} to update.`)
      res.status(500).json(responseFactory('reject','Kirjet ei leitud!'))
    } else {
      console.log(`${key} of document ${id} is now ${value}`)
      res.status(200).json(responseFactory('accept','ok',d))
    }
  })
  .catch(e => {
    console.log(e)
    res.status(500).json(responseFactory('reject', '', e))
  })
})

module.exports = router