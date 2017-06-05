const express = require('express'),
fileUpload = require('express-fileupload'),
app = express.Router()

// default options 
//app.use(bodyParser.urlencoded({ extended: true }))

app.use(fileUpload())
 
app.post('/file', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.')
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file
  let sampleFileExt = req.files.file.name.split('.').pop()
  console.log(sampleFileExt)

  if(sampleFileExt == 'xlsx'){
  	sampleFile.mv(`/var/www/mets-be/uploaded_files/${sampleFile.name}`, function(err) {
    
    if (err)
      return res.status(500).send(err)
    	res.send('File uploaded!')
  	})
  } else {
  	res.send('Incorrect file type!')
  }
})

module.exports = app