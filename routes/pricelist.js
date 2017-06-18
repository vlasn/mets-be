const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
pricelist = require('./../models/southNorthPricelistModel.js')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/master_pricelist/add",(req, res)=>{
	pricelist.insert(req.body)
		.then(docs => {
			console.log("Sisestati " + docs.length + " rida")
			res.status(200).json(responseFactory("accept","Sisestati " + docs.length + " rida"))
		})
		.catch(err => {
			console.log("Veateade:",err)
			res.status(500).json(responseFactory("reject","Midagi läks valesti... :("))
		})
})

module.exports = {router}