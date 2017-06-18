const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
pricelist = require('./../models/southNorthPricelistModel.js')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/add",(req, res)=>{
	pricelist.insert(req.body)
		.then(docs => {
			res.status(200).json(responseFactory("accept","", docs))
		}
		,err => {
			res.status(500).json(responseFactory("reject", err))
		})
})

module.exports = {router}