const express = require('express')
router = express.Router(),
bodyParser = require('body-parser'),
pricelist = require('./../models/southNorthPricelistModel.js'),
importModel = require('./../models/importModel.js'),
parse = require('./parse.js')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post("/add",(req, res)=>{
	pricelist.insert(req.body)
	.then(docs => {
		if(!docs) {return Promise.reject("Viga!")}
		importModel.findById(req.body.parentId)
		.then(d=>{
			if(!d) {return Promise.reject("Ei leidnud sellise parentId'ga dokumenti!")}
			parse(d)
			.then(data=>{
				importModel.updateWholeDoc(data)
				.then(d=>{
					res.status(200).json(responseFactory("accept","", d))
				})
				.catch(e=>{
					res.status(500).json(responseFactory("reject", e))
				})
			})
		})
		.catch(e=>{
			res.status(500).json(responseFactory("reject", e))
		})
/*		importModel.updateWholeDoc(req.body.parentId)
		.then(d=>{
			res.status(200).json(responseFactory("accept","", docs))
		})
		.catch(e=>{
			res.status(500).json(responseFactory("reject", err))
		})*/
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