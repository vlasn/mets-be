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

router.post('/snapshot', (req, res)=>{
	let region = req.body.region
	let ylest = req.body.ylestootamine
	let vosatood = req.body.vosatood
	let vedu = req.body.vedu
	let tasu = req.body.tasu
	pricelist.returnTemplate()
	.then(d=>{
		let snapshot = d.map(r=>{
			return {
				Sihtkoht: r.Sihtkoht,
		    Puuliik: r.Puuliik,
		    Sortiment: r.Sortiment,
		    Diameeter_min: r.Diameeter_min,
		    Diameeter_max: r.Diameeter_max,
		    Pikkus_min: r.Pikkus_min,
		    Pikkus_max: r.Pikkus_max,
		    Kvaliteet: r.Kvaliteet,
		    Hind: r.Hind,
		    Ylestootamine: ylest,
		    Vosatood: vosatood,
		    Vedu: vedu,
		    Tasu: tasu,
		    Tulu: parseFloat(r.Hind) - (parseFloat(ylest) + parseFloat(vosatood) + parseFloat(vedu) + parseFloat(tasu))
			}
		})
		res.status(200).json(responseFactory("accept", "", snapshot))
	})
})

module.exports = {router}