'use strict'

const router = require('express').Router(),
fileUpload = require('express-fileupload'),
xlsxToJson = require('../utils/xlsxToJson'),
report = require('./../models/report.js'),
pricelist = require('./../models/southNorthPricelistModel.js'),
mongoose = require('mongoose'),
path = require('path'),
responseFactory = require('../utils/response'),
parse = require('../utils/parse'),
destructure = require('../utils/destructure'),
secret = process.env.SECRET

router.post('/', fileUpload(), (req, res, next)=>{
  if (!req.files) return res.status(400).send('No files were uploaded.')

  const file = req.files.file,
  fileName = namify(req.files.file.name),
  fileExtension = extensify(fileName),
  fileLocation = path.resolve(__dirname, `../uploaded_files/${fileName}`)

  if (fileExtension !== 'xlsx') return res.status(400).send('Incorrect file type')
  
  file.mv(fileLocation, async err => {
    if (err) return next(new Error(err))

    try {
      const convertedData = xlsxToJson(fileLocation, fileName),
      parsedData = await parse(convertedData),
      insertedData = await report.insert(parsedData)
      res.json(responseFactory('accept', '', insertedData))
    } catch (error) {
      next(new Error(error))
    }
  })
})

router.get('/:id', async (req, res, next)=>{
  try {
    const reportId = req.params.id,
    result = await report.findById(reportId)
    res.send(responseFactory('accept', '', result))
  } catch (error) {
    next(new Error(error))
  }
})


router.put('/:id', async (req, res, next) => {
  try {
    const rowId = req.params.id,
    update = req.body
    res.send(responseFactory('accept', '', await report.updateDoc(rowId, update))) 
  } catch (error) {
    next(new Error(error))
  }
})

router.post('/xlsx/findMatch', (req, res)=>{
  pricelist.checkForMatch(req.body)
  .then(d=>{
    if (d === false) return Promise.reject('Ei leidnud vastet!')
    res.status(200).json(responseFactory("accept", "Leidsin vaste!", d.vaste))
  })
  .catch(e => res.status(404).json(responseFactory("reject", e)))
})

router.get('/fetchCargoPages', (req, res)=>{
  let cadastreID = req.query.cadastreid.split(',')
  console.log(cadastreID)
  //for(c in req.body.cadastreIdentifiers) {cadastreIdentifiers.push(cadastreIdentifiers[c])}
  report.fetchCargoPages(cadastreID)
   .then(docs => {
     let response = docs
     .reduce((acc, val) => acc = [...acc, ...val.veoselehed],[])
     .map(val => val.rows)
     .reduce((acc,val) => [...acc,...val],[])
     .map(row => ({
        price: row['Hind'],
        date: row['veoselehe kuupäev'],
        name: row['Elvise VL nr'],
        volume: row['arvestus maht']
      }))
    console.log(response)
    res.status(200).json(responseFactory("accept", "Siin on stuffi", response))
  })
  .catch(err=>{res.status(500).send(responseFactory("reject", err))})
})

router.get('/fieldOpts/:fieldKey', (req, res)=>{
  pricelist.returnDistinct(req.params.fieldKey)
  .then(d=>{
    let r
    if(req.params.fieldKey.includes("Diameeter") || req.params.fieldKey.includes("Pikkus")) {
      r = d.filter((t)=>{return typeof t === 'number'})
    } else {
      r = d
    }
    res.status(200).json(responseFactory("accept", "Siin on stuffi", r))
  })
  .catch(err=>{res.status(500).send(err)})
})

const namify = x => x.split(`.`).shift()+`_`+ Date.now() +`.`+extensify(x)
const extensify = x => x.split(`.`).pop()


module.exports = router
