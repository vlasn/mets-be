'use strict'

const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema
//const userModel = require('./userModel.js').userModel
const respondWith = require('../utils/response')

const southNorthPricelistModel = mongoose.model('southnorth_price', pricelistSchema)

const insert = (data) => {
  let row = new southNorthPricelistModel({ 
    Sihtkoht: data.Sihtkoht,
    Puuliik: data.Puuliik,
    Sortiment: data.Sortiment,
    Diameeter_min: data.Diameeter_min,
    Diameeter_max: data.Diameeter_max,
    Pikkus_min: data.Pikkus_min,
    Pikkus_max: data.Pikkus_max,
    Kvaliteet: data.Kvaliteet,
    Hind: data.Hind,
    Ylestootamine: data.Ylestootamine,
    Vosatood: data.Vosatood,
    Vedu: data.Vedu,
    Tasu: data.Tasu,
    Tulu: data.Tulu
  })
  return row.save()
}

// Puuliik, Kvaliteet, Diameeter_min, Diameeter_max, Pikkus_min, Pikkus_max

const returnDistinct = k => {
  return southNorthPricelistModel.find().distinct(k)
}

const returnTemplate = () => {
  return southNorthPricelistModel.find({})
}

// accepts report row json object
const findProductReferenceId = async row => {
  const key = row['hinna gr  "võti"']

  return (await southNorthPricelistModel.findOne(!key || typeof key !== 'string' ? {
      Sihtkoht: {$regex: row['Ostja']},
      Puuliik: row['puuliik'],
      Kvaliteet: {$regex: row['kvaliteet'], $options: 'i'}
    } : {
      Sihtkoht: {$regex: row['Ostja']},
      Puuliik: row['puuliik'],
      Kvaliteet: {$regex: row['kvaliteet'], $options: 'i'},
      Diameeter_min: row['hinna gr  "võti"'].replace(/,/g,'.').split('-')[0],
      Diameeter_max: row['hinna gr  "võti"'].replace(/,/g,'.').split('-')[1]
    }, '_id'))._id
}

const addProduct = (req, res, next) => { 
  const new_product_data = req.body

  southNorthPricelistModel.create(new_product_data, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.status(201).json(respondWith('accept', 'Kirje loodud', doc._id))
  })
}

const updateProduct = async (req, res, next) => {
  const _id = {_id: mongoose.Types.ObjectId(req.params.id)}, update_data = req.body,
  old_product_data = (await southNorthPricelistModel.findOne(_id, {},{lean: true})),
  new_product_data = Object.assign({}, old_product_data, {_id}, update_data),
  update = {'$set': new_product_data}

  southNorthPricelistModel.findOneAndUpdate(_id, update_data, {new: true, lean: true}, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.json(respondWith('accept', 'Kirje muudetud', doc))
  })
}

module.exports = {updateProduct, addProduct, southNorthPricelistModel, insert, findProductReferenceId, returnDistinct, returnTemplate}

