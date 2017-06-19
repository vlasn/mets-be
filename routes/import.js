const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
xlsx = require('xlsx'),
bodyParser = require('body-parser'),
importModel = require('./../models/importModel.js'),
pricelist = require('./../models/southNorthPricelistModel.js'),
helper = require('./helper.js'),
mongoose = require('mongoose'),
path = require('path'),
responseFactory = helper.responseFactory,
parse = require('./parse'),
destructure = require('./destructure')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended: true}))
router.use(fileUpload())
 
// when a file is initially imported into the system
// this endpoint is used only once per imported document (.xlsx)
router.post('/xlsx/new', (req, res)=>{
  if (!req.files) return res.status(400).send('No files were uploaded.')
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file
  let sampleFileExt = req.files.file.name.split('.').pop()

  if(sampleFileExt == 'xlsx'){
	//console.log(__dirname)
	let loc = path.resolve(__dirname, `../uploaded_files/${sampleFile.name}`)
  	sampleFile.mv(loc, function(err) {
    	if (err) return res.status(500).send(err)

      let workbook = xlsx.readFile(loc)
      let sheet_name_list = workbook.SheetNames
      let data = {unmatched: []}

      for(let y of sheet_name_list){
        let worksheet = workbook.Sheets[y]
        let headers = {}

        for(let z in worksheet) {
          if(z[0] === '!') continue
          let c = "", r = ""
          for(s of z) isNaN(s) ? c+=s : r+=s
          r = parseInt(r)
          let value = worksheet[z].v

          //store header names
          if(r == 1) {
            headers[c] = value
            continue
          }

          if(!data.unmatched[r]) data.unmatched[r]={}
          data.unmatched[r][headers[c]] = value
        }

        //drop those first two rs which are empty
        data.unmatched.shift()
        data.unmatched.shift()
      }

    	parse(data)
      .then(d=>{
        //console.log(d)
      	importModel.newDoc(d)
      	.then(ok=>{
      		res.status(200).json(responseFactory("accept", "Matched: "+d.matched.length+" and unmatched: "+d.unmatched.length, ok))
      	},
      	e=>{
      		res.status(500).send(e)
      	})
      })
      .catch(e=>res.status(500).json(responseFactory("reject", e)))

  	})
  } else {
  	res.status(400).send('Incorrect file type!')
  }
})

// FE sends in _id and altered version of the document.unmatched.$ r
// BE finds that r in MongoDB by _id, applies the changes made by FE
// then reparses the whole document and if there's no unmatched rs
// the document will be destructured
router.post('/xlsx/update', (req, res)=>{
  console.log(req.body)
  importModel.updateDoc(req.body)
  .then(d=>{
    // FE should reload with this payload
    //parse(d)
/*    .then(d=>{
      if()
      d.unmatched.length == 0 ? res.status(200).json(responseFactory("accept", "", destructure(d))) : res.status(200).json(responseFactory("accept", "", d))
    })*/
    console.log(d)
    pricelist.checkForMatch(d)
    .then(d=>{res.send(d)})
  })
  .catch(e=>res.status(500).json(responseFactory("reject", e)))
})

router.get('/fetch', (req, res)=>{
  let id = req.query.id
  importModel.retrieve(id)
  .then(d=>{
    if(!d) {return Promise.reject('Polnud docse')}
    res.status(200).json(responseFactory("accept", "Siin on stuffi", d))
  })
  .catch(err=>{res.status(500).send(err)})
})



router.get('/fieldOpts/:fieldKey', (req, res)=>{
  pricelist.returnDistinct(req.params.fieldKey)
  .then(d=>{
    if(req.params.fieldKey.includes("Diameeter") || req.params.fieldKey.includes("Pikkus")) {
      let r = d.filter((t)=>{return typeof t === 'number'})
    } else {
      r = d
    }
    res.status(200).json(responseFactory("accept", "Siin on stuffi", r))
  })
  .catch(err=>{res.status(500).send(err)})
})

module.exports = {router}
