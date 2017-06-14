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
router.post('/xlsx', (req, res)=>{
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
      var data = []

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

          if(!data[row]) data[row]={}
          data[row][headers[col]] = value
        }

        //drop those first two rows which are empty
        data.shift()
        data.shift()
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

// a document will be sent here FROM initial import endpoint
const parseDocument = (documentObj) => {
  var matched = 0
  var unmatched = 0
  var parsedObj = {
    unmatched: [],
    matched: [],
    status: "pending"
  }
  var promises = []
  for(let row of documentObj){
    // 1 promise iga row'i kohta
    var promise = masterPricelist.checkForMatch(row)
      .then(result=>{
        if(result){
          parsedObj.matched.push(result)
          matched = matched + 1
        } else {
          parsedObj.unmatched.push(row)
          unmatched = unmatched + 1
        }
        //console.log("result: " , result)
      })
    promises.push(promise)
  }
  return Promise.all(promises)
  .then(()=>{
  	if(parsedObj.unmatched.length > 0) {parsedObj.status = "reject"}
  	else if(parsedObj.unmatched.length == 0 && parsedObj.matched.length > 0) {parsedObj.status = "accept"}
  	console.log(parsedObj)
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
