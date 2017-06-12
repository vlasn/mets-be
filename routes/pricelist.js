const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
masterPricelistModel = require('./../models/masterPricelistModel.js')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/master_pricelist/add",(req, res)=>{
	masterPricelistModel.insert(req.body)
		.then(docs => {
			console.log("Sisestati " + docs.length + " rida")
			res.json(responseFactory("accept","Sisestati " + docs.length + " rida"))
		})
		.catch(err => {
			console.log("Veateade:",err)
			res.json(responseFactory("reject","Midagi läks valesti... :("))
		})
})

module.exports = {router}