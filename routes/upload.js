const express = require('express'),
fileUpload = require('express-fileupload'),
router = express.Router(),
auth = require('./auth.js'),
responseFactory = auth.responseFactory

router.use(fileUpload())

router.post('/pdf', function(req, res) {
  if (!req.files) return res.status(400).send('No files were uploaded.')
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  let sampleFile = req.files.file
  let sampleFileExt = req.files.file.name.split('.').pop()
  //console.log(sampleFileExt)

  if(sampleFileExt == 'pdf'){
    let loc = `/var/www/mets-be/uploaded_files/${sampleFile.name}`
  	sampleFile.mv(loc, function(err) {
    	if (err) return res.status(500).send(err)
    	res.json(responseFactory("accept","File was uploaded!"))
    })
  } else {
  	res.send('Incorrect file type!')
  }
})

module.exports = {router}