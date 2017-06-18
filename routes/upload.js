const express = require('express'),
multer = require('multer'),
router = express.Router(),
helper = require('./helper.js'),
responseFactory = helper.responseFactory,
contractModel = require('./../models/contractModel.js'),
path = require('path')

const loc = path.resolve(__dirname, `../uploaded_files/`),
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, loc)
  },
  filename: function (req, file, cb) {
  	let name = file.originalname.split('.').shift()
  	let ext = "." + file.originalname.split('.').pop()
    cb(null, name + '_' + Date.now() + ext)
  }
}),
upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.pdf') return cb(new Error('Only pdfs are allowed'))
    cb(null, true)
  }
}).single('leping')

router.post('/leping', function (req, res) {
	upload(req, res, function (err) {
    if (err){
    	console.log(err)
    	res.status(500).json(responseFactory("reject","Something went wrong... :("))
   	}
    console.log(req.body)
    res.status(200).json(responseFactory("accept","File was uploaded!"))
  })
})

router.post('/metsateatis', function (req, res) {
	upload(req, res, function (err) {
    if (err){
    	console.log(err)
    	res.status(500).json(responseFactory("reject","Something went wrong... :("))
   	}
    console.log(req.body)
    res.status(200).json(responseFactory("accept","File was uploaded!"))
  })
})

module.exports = {router}

