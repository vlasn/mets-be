const express = require('express'),
fileUpload = require('express-fileupload'),
app = express.Router(),
xlsx = require('xlsx'),
masterPricelist = require('./../models/masterPricelistModel.js')

// default options 
//app.use(bodyParser.urlencoded({ extended: true }))

app.use(fileUpload())
 
app.post('/xlsx', function(req, res) {
  if (!req.files) return res.status(400).send('No files were uploaded.')
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file
  let sampleFileExt = req.files.file.name.split('.').pop()
  console.log(sampleFileExt)

  if(sampleFileExt == 'xlsx'){
  	sampleFile.mv(`/var/www/mets-be/uploaded_files/${sampleFile.name}`, function(err) {
    	if (err) return res.status(500).send(err)

      // some parsing logic
      // 1) find matches from master_pricelist
      findPricelistMatches(sampleFile)
      // structureBasedOnCadastres(sampleFile)




    	res.send('File uploaded!')
  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

const findPricelistMatches = (data) => {
// parse the excel file into an array of objects
  var matches
  var workbook = xlsx.readFile(data)
  var sheet_name_list = workbook.SheetNames
  sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y]
    var headers = {}
    var data = []
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

  // traversing the array of row objects 
  // searching for matches in masterpricelist

  for(let row of data){

    console.log(row)
    if(masterPricelist.checkForMatch){
      matches += 1
    }
  }
  return matches
}


const structureBasedOnCadastres = (data) => {

}

module.exports = app