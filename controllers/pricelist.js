'use strict'

const Pricelist = require('../models/southNorthPricelistModel.js'),
mongoose = require('mongoose'),
respondWith = require('../utils/response')

// // LEGACY CODE
// exports.snapshot = (req, res, next) => {
//   let region = req.body.region
//       ylest = req.body.ylestootamine
//       vosat = req.body.vosat
//       vedu = req.body.vedu
//       tasu = req.body.tasu
//   pricelist.returnTemplate()
//   .then(d=>{
//     let snapshot = d.map(r=>{
//       return {
//         Sihtkoht: r.Sihtkoht,
//         Puuliik: r.Puuliik,
//         Sortiment: r.Sortiment,
//         Diameeter_min: r.Diameeter_min,
//         Diameeter_max: r.Diameeter_max,
//         Pikkus_min: r.Pikkus_min,
//         Pikkus_max: r.Pikkus_max,
//         Kvaliteet: r.Kvaliteet,
//         Hind: r.Hind,
//         Ylestootamine: ylest,
//         Vosatood: vosat,
//         Vedu: vedu,
//         Tasu: tasu,
//         Tulu: parseFloat(r.Hind) - (parseFloat(ylest) + parseFloat(vosat) + parseFloat(vedu) + parseFloat(tasu))
//       }
//     })
//     res.status(200).json(responseFactory("accept", "", snapshot))
//   })
// }

exports.returnDistinct = k => {
  return Pricelist.find().distinct(k)
}

exports.returnTemplate = () => {
  return Pricelist.find({})
}

// accepts report row json object
exports.findProductReferenceId = async row => {
  try {
    const key = row['hinna gr  "võti"'] || '',
    {Ostja = '', puuliik = '', kvaliteet = ''} = row

    if (!Ostja || !puuliik || !kvaliteet || !key) return

    const result = (await Pricelist.findOne({
        Sihtkoht: {$regex: row['Ostja']},
        Puuliik: row['puuliik'],
        Kvaliteet: {$regex: row['kvaliteet'], $options: 'i'},
        Diameeter_min: row['hinna gr  "võti"'].replace(/,/g,'.').split('-')[0],
        Diameeter_max: row['hinna gr  "võti"'].replace(/,/g,'.').split('-')[1]
      }, '_id'))._id || null

    if (result) return result
  } catch (error) {return}
}

exports.addProduct = (req, res, next) => { 
  const new_product_data = req.body

  Pricelist.create(new_product_data, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.status(201).json(respondWith('accept', 'Kirje loodud', doc._id))
  })
}

exports.updateProduct = async (req, res, next) => {
  const _id = {_id: mongoose.Types.ObjectId(req.params.id)}, update_data = req.body,
  old_product_data = (await Pricelist.findOne(_id, {},{lean: true})),
  new_product_data = Object.assign({}, old_product_data, {_id}, update_data),
  update = {'$set': new_product_data}

  Pricelist.findOneAndUpdate(_id, update_data, {new: true, lean: true}, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.json(respondWith('accept', 'Kirje muudetud', doc))
  })
}

