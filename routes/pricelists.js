'use strict'

const router = require('express').Router(),
bodyParser = require('body-parser'),
pricelist = require('./../models/southNorthPricelistModel.js'),
report = require('./../models/report.js'),
parse = require('./parse.js'),
responseFactory = require('../util/response')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))


router.route("/")
.put((req, res)=>{
	pricelist.insert(req.body)
	.then(docs => {
		if(!docs) return Promise.reject("Viga!")
		report.findById(req.body.parentId)
		.then(d=>{
			if(!d) {return Promise.reject("Ei leidnud sellise parentId'ga dokumenti!")}
			parse(d)
			.then(data=>{
				report.updateWholeDoc(data)
				.then(d=>{
					console.log(d)
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
/*		report.updateWholeDoc(req.body.parentId)
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
.get((req, res)=>{
	let region = req.body.region
			ylest = req.body.ylestootamine
			vosat = req.body.vosat
			vedu = req.body.vedu
			tasu = req.body.tasu
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
		    Vosatood: vosat,
		    Vedu: vedu,
		    Tasu: tasu,
		    Tulu: parseFloat(r.Hind) - (parseFloat(ylest) + parseFloat(vosat) + parseFloat(vedu) + parseFloat(tasu))
			}
		})
		res.status(200).json(responseFactory("accept", "", snapshot))
	})
})

module.exports = router