const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
xlsx = require('xlsx'),
bodyParser = require('body-parser'),
masterPricelist = require('./../models/masterPricelistModel.js'),
pricelist = require('./../models/southNorthPricelistModel.js'),
importModel = require('./../models/importModel.js'),
helper = require('./helper.js'),
path = require('path'),
responseFactory = helper.responseFactory

// default options 
//app.use(bodyParser.urlencoded({ extended: true }))
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
      var matches = 0
      var mismatches = 0
      var workbook = xlsx.readFile(loc)
      var sheet_name_list = workbook.SheetNames
      var data = {
      	unmatched: []
      }

      sheet_name_list.forEach(function(y) {

        var worksheet = workbook.Sheets[y]
        var headers = {}

        for(z in worksheet) {
          if(z[0] === '!') continue
          //parse out the column, row, and value
					if(z.length < 3){
						var col = z.substring(0,1)
	          var row = parseInt(z.substring(1))
        	} else if(z.length > 2){
        		var col = z.substring(0,2)
	          var row = parseInt(z.substring(2))
        	}
          var value = worksheet[z].v

          //store header names
          if(row == 1) {
            headers[col] = value
            continue
          }

          if(!data.unmatched[row]) data.unmatched[row]={}
          data.unmatched[row][headers[col]] = value
        }

        //drop those first two rows which are empty
        data.unmatched.shift()
        data.unmatched.shift()
        //console.log(data[0])
        //console.log(data.length)
      })
    	
    	parseDocument(data)
      .then(d=>{
      	importModel.newDoc(d)
      	.then(ok=>{
      		res.json(responseFactory("accept", "Here you go sir", ok))
      	},
      	err=>{
      		res.send(err)
      	})
      })
      .catch(err=>res.json(responseFactory("rejectXOXO", err)))

  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

router.post('/xlsx/update', (req, res)=>{
   parseDocument(req.body)
  .then(d=>{
  	if(d.unmatched.length > 0){
		  importModel.updateDoc(d)
    	.then(ok=>{
    		res.json(responseFactory("accept", "Uploaded to MongoDB", ok))
    	},
    	err=>{
    		res.send(err)
    	})
  		res.json(responseFactory("accept", "Needs attention", d))
  	} else if(d.unmatched.length == 0 && d.matched.length > 0){
  		destructureDocument(d)
  		.then(results=>{
	  		importModel.updateDoc(results)
	    	.then(ok=>{
	    		res.json(responseFactory("accept", "Uploaded to MongoDB", ok))
	    	},
	    	err=>{
	    		res.send(err)
	    	})
  		})
  	}
  })
  .catch(err=>res.json(responseFactory("reject", err)))
})

// a document will be sent here FROM initial import endpoint
const parseDocument = (documentObj) => {

	//console.log(documentObj)
  if(!documentObj.matched) {documentObj.matched = []}
  documentObj.veoselehed = []
  documentObj.status = "pending"

  //console.log("documentObj on: ",documentObj)

  var promises = []
  for(let row of documentObj.unmatched){
    var promise = pricelist.checkForMatch(row)
      .then(result=>{
        if(result){
        	let index = documentObj.unmatched.indexOf(row)
        	console.log(index)
        	documentObj.unmatched.splice(index,1)
          documentObj.matched.push(result)
        }
      })
    promises.push(promise)
  }

  return Promise.all(promises)
  .then(()=>{
  	if(documentObj.unmatched.length > 0) {documentObj.status = "reject"}
  	else if(documentObj.unmatched.length == 0 && documentObj.matched.length > 0) {documentObj.status = "accept"}
  	console.log(documentObj)
    return documentObj
  })
}

const destructureDocument = (fullyParsedDoc) => {
	let promise = new Promise((resolve,reject)=>{


		if(fullyParsedDoc.unmatched.length == 0 && fullyParsedDoc.matched.length > 0){
			for(let row of fullyParsedDoc.matched){
				if(fullyParsedDoc.matched.indexOf(row) == 0){
					fullyParsedDoc.veoselehed[0] = {
						VL_nr: row['Elvise VL nr'],
						cadastre: row['Katastritunnus'],
						rows: []
					}
					fullyParsedDoc.veoselehed[0].rows.push(row)
				} else if(fullyParsedDoc.matched.indexOf(row) > 0){
					let len = fullyParsedDoc.veoselehed.length
					for(let el of fullyParsedDoc.veoselehed){
						if(row['Elvise VL nr'] == el.VL_nr){
							el.rows.push(row)
							break
						} else if(row['Elvise VL nr'] != el.VL_nr){
							fullyParsedDoc.veoselehed[len] = {
								VL_nr: row['Elvise VL nr'],
								cadastre: row['Katastritunnus'],
								rows: []
							}
							fullyParsedDoc.veoselehed[len].rows.push(row)
							break
						}
					}
				}
			}
			//console.log(fullyParsedDoc)
			resolve(fullyParsedDoc)
		} else {resolve(fullyParsedDoc)}
	})

	return promise
	.then(val=>{
		return val
	})
}

router.get('/fetch', (req, res)=>{
  importModel.retrieve()
  .then(docs=>{
    if(docs){res.json(responseFactory("accept", "Siin on stuffi", docs))}
  })
  .catch(err=>{console.log("err",err)})
})

module.exports = {router}
