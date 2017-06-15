const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
xlsx = require('xlsx'),
masterPricelist = require('./../models/masterPricelistModel.js'),
importModel = require('./../models/importModel.js'),
helper = require('./helper.js'),
path = require('path'),
responseFactory = helper.responseFactory

// default options 
//app.use(bodyParser.urlencoded({ extended: true }))

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
          if(z[0] === '!') continue;
          //parse out the column, row, and value
          var col = z.substring(0,1)
          var row = parseInt(z.substring(1))
          var value = worksheet[z].v

          //store header names
          if(row == 1) {
            headers[col] = value
            continue;
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
      	importModel.insertDoc(d)
      	.then(ok=>{
      		res.json(responseFactory("accept", "Here you go sir", ok))
      	})
      })
      .catch(err=>res.json(responseFactory("reject", err)))

  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

router.post('/xlsx/update', (req, res)=>{
   parseDocument(req.body)
  .then(d=>{
  	if(d.unmatched.length > 0){

  		res.json(responseFactory("accept", "Needs attention", d))
  	} else if(d.unmatched.length == 0 && d.matched.length > 0){
  		destructureDocument(d)
  		.then(results=>{

  		})
  		.catch(err=>{
  			res.send(err)
  		})
  	}
  })
  .catch(err=>res.json(responseFactory("reject", err)))
})

// a document will be sent here FROM initial import endpoint
const parseDocument = (documentObj) => {

/*  var parsedObj = {
    unmatched: [],
    matched: [],
    veoselehed: [],
    status: "pending"
  }*/
  documentObj.matched = []
  documentObj.veoselehed = []
  documentObj.status = "pending"

  console.log("documentObj on: ",documentObj)

  var promises = []
  for(let row of documentObj.unmatched){
    // 1 promise iga row'i kohta
    var promise = masterPricelist.checkForMatch(row)
      .then(result=>{
        if(result){
        	let index = documentObj.unmatched.indexOf(result)
        	console.log(index)
        	let item = documentObj.unmatched.slice(index, index+1)
        	documentObj.unmatched.splice(index,1)
          parsedObj.matched.push(result)
        }
        //console.log("result: " , result)
      })
    promises.push(promise)
  }
  return Promise.all(promises)
  .then(()=>{
  	if(parsedObj.unmatched.length > 0) {parsedObj.status = "reject"}
  	else if(parsedObj.unmatched.length == 0 && parsedObj.matched.length > 0) {parsedObj.status = "accept"}
  	//console.log(parsedObj)
    return parsedObj
  })
}

const destructureDocument = (fullyParsedDoc) => {
	
}

router.get('/fetch', (req, res)=>{
  importModel.retrieve()
  .then(docs=>{
    if(docs){res.json(responseFactory("accept", "Siin on stuffi", docs))}
  })
  .catch(err=>{console.log("err",err)})
})

module.exports = {router}
