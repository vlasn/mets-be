const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
xlsx = require('xlsx'),
bodyParser = require('body-parser'),
importModel = require('./../models/importModel.js'),
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

          let arr = z.split("")
          let rowStart = null
          let colStart = null

          for(let l of arr){
            if(isNaN(l) && colStart === null){
              colStart = arr.indexOf(l)
            } else if(!isNaN(l) && rowStart === null){
              rowStart = arr.indexOf(l)
            }
          }
        
          let col = z.substring(colStart,rowStart)
          let row = parseInt(z.substring(rowStart, arr.length))
          let value = worksheet[z].v

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
      }

    	parse(data)
      .then(d=>{
        console.log(d)
      	importModel.newDoc(d)
      	.then(ok=>{
      		res.json(responseFactory("accept", "Here you go sir", ok))
      	},
      	e=>{
      		res.send(e)
      	})
      })
      .catch(e=>res.json(responseFactory("reject", e)))

  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

// FE sends in _id and altered version of the document.unmatched.$ row
// BE finds that row in MongoDB by _id, applies the changes made by FE
// then reparses the whole document and if there's no unmatched rows
// the document will be destructured
router.post('/xlsx/update', (req, res)=>{
  importModel.updateDoc(req.body)
  .then(d=>{
    // FE should reload with this payload
    parse(d)
    .then(d=>{
      d.unmatched.length == 0 ? res.json(responseFactory("accept", "", destructure(d))) : res.json(responseFactory("accept", "", d))
    })
  })
  .catch(e=>res.json(responseFactory("reject", e)))
})

/*const destructureDocument = (fullyParsedDoc) => {
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
			resolve(fullyParsedDoc)
		} else {resolve(fullyParsedDoc)}
	})

	return promise
	.then(d=>{
		return d
	})
}*/

router.get('/fetch', (req, res)=>{
  importModel.retrieve()
  .then(docs=>{
    if(docs){res.json(responseFactory("accept", "Siin on stuffi", docs))}
  })
  .catch(err=>{console.log("err",err)})
})

module.exports = {router}
