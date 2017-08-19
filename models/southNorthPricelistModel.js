'use strict'

const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

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
const checkAndApplyMatch = async row => {
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

module.exports = {southNorthPricelistModel, insert, checkAndApplyMatch, returnDistinct, returnTemplate}

