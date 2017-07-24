'use strict'

const router = require('express').Router(),
fileUpload = require('express-fileupload'),
xlsx = require('xlsx'),
bodyParser = require('body-parser'),
report = require('./../models/report.js'),
pricelist = require('./../models/southNorthPricelistModel.js'),
mongoose = require('mongoose'),
path = require('path'),
responseFactory = require('../util/response'),
parse = require('./parse'),
destructure = require('./destructure'),
secret = process.env.SECRET

router.route('/')
.post(fileUpload(), (req, res)=>{
  if (!req.files) return res.status(400).send('No files were uploaded.')

  // The name of the input field (i.e. "reportFile") is used to retrieve the uploaded file
  let reportFile = req.files.file
  let reportFileExtension = req.files.file.name.split('.').pop()
  req.files.file.name = req.files.file.name.split('.').shift() + "_" +
  Date.now() + "." + reportFileExtension

  if(reportFileExtension !== 'xlsx') return res.status(400).send('Incorrect file type')
  //console.log(__dirname)
  let loc = path.resolve(__dirname, `../uploaded_files/${reportFile.name}`)
	reportFile.mv(loc, err => {
  	if (err) return res.status(500).send(err)

    let workbook = xlsx.readFile(loc)
    let sheet_name_list = workbook.SheetNames
    let data = {unmatched: [],
                filename: req.files.file.name}

    for(let y of sheet_name_list){
      let worksheet = workbook.Sheets[y]
      let headers = {}

      for (let z in worksheet) {
        if(z[0] === '!') continue
        let c = "", r = ""
            value = worksheet[z].v

        for (s of z) isNaN(s) ? c+=s : r+=s*1

        if (r == 1) {
          headers[c] = value
          continue
        }

        if (!data.unmatched[r]) data.unmatched[r] = {}
        data.unmatched[r][headers[c]] = value
      }
      //drop those first two rs which are empty
      data.unmatched.shift()
      data.unmatched.shift()
    }

  	parse(data)
    .then(d=>{
      //console.log(d)
    	report.newDoc(d)
    	.then(ok=>{
    		res.status(200).json(responseFactory("accept", "Matched: "+d.matched.length+" and unmatched: "+d.unmatched.length, ok))
    	},
    	e=>{
    		res.status(500).send(e)
    	})
    })
    .catch(e => res.status(500).json(responseFactory("reject", e)))

	})
})
.get((req, res)=>{
  let id = req.query.id
  report.retrieve(id)
  .then(d=>{
    if(!d) return Promise.reject('Polnud docse')
    res.status(200).json(responseFactory("accept", "Siin on stuffi", d))
  })
  .catch(err => res.status(500).send(err))
})

// for inserting a manually altered report row
router.put('/:id', (req, res) => {
  report.updateDoc(req.body)
  .then(data => {
    if (!data) return Promise.reject('Ei leidnud uuendatavat alamdokumenti!')
  	parse(data)
  	.then(d=>{
  		let responseData = d
  		console.log(d.unmatched.length, d.matched.length)
  		pricelist.checkForMatch(req.body)
  		.then(d=>{
  			if (d === false) return Promise.reject('Ei leidnud vastet!')
  			let response = {
	  			matched: responseData.matched.length,
	  			unmatched: responseData.unmatched.length
	  		}
  			res.status(200).json(responseFactory("accept", "", response))
  		})
  		.catch(e => res.status(500).json(responseFactory("reject", e)))
  	})
  })
  .catch(e => res.status(500).json(responseFactory("reject", e)))
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

module.exports = router
