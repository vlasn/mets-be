const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
xlsx = require('xlsx'),
masterPricelist = require('./../models/masterPricelistModel.js'),
helper = require('./helper.js'),
responseFactory = helper.responseFactory

// default options 
//app.use(bodyParser.urlencoded({ extended: true }))

router.use(fileUpload())
 
router.post('/xlsx', function(req, res) {
  if (!req.files) return res.status(400).send('No files were uploaded.')
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file
  let sampleFileExt = req.files.file.name.split('.').pop()

  if(sampleFileExt == 'xlsx'){
    let loc = `/var/www/mets-be/uploaded_files/${sampleFile.name}`
  	sampleFile.mv(loc, function(err) {
    	if (err) return res.status(500).send(err)

      // some parsing logic
      // 1) find matches from master_pricelist

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

          var checked = {
            vasteta: [],
            vastega: []
          }
          var promises = []
          for(let row of data){
            // 1 promise iga row'i kohta
            var promise = masterPricelist.checkForMatch(row)
              .then(result=>{
                if(result){
                  checked.vastega.push(result)
                  matches = matches + 1
                } else {
                  //checked.vasteta.push(row)
                  mismatches = mismatches + 1
                }
                //console.log("result: " , result)
              })
            promises.push(promise)
          }

          // enne oli rida selline
          // return Promise.all(promises)
          // miks return oli? @Romil
          Promise.all(promises)
            .then(()=>{
              res.json(responseFactory("accept",'Leiti ' + matches + ' vaste(t) ja ' + mismatches + ' ebakõla', checked))
              //res.send('Leiti ' + matches + ' vaste(t) ja ' + mismatches + ' ebakõla')
            })
  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

const structureBasedOnCadastres = (data) => {

}

module.exports = {router}