'use strict'

const Product = require('../models/product.js').model
const mongoose = require('mongoose')
const { newError } = require('../errors')
const isValid = mongoose.Types.ObjectId.isValid
const Property = require('../models/property')
const success = require('../utils/respond')
const asyncMiddleware = require('../utils/asyncMiddleware')
const Offer = require('../models/offer')

exports.returnDistinct = k => {
  return Product.find().distinct(k)
}

exports.find = async (req, res, next) => {
  success(res, await Product.find({}))
}

// accepts report row json object
exports.match = async row => {
  try {
    const key = row['hinna gr  "võti"'] || '',
      {Ostja = '', puuliik = '', kvaliteet = ''} = row

    if (!Ostja || !puuliik || !kvaliteet || !key) return

    const result = (await Product.findOne({
      Sihtkoht: {$regex: row['Ostja']},
      Puuliik: row['puuliik'],
      Kvaliteet: {$regex: row['kvaliteet'], $options: 'i'},
      Diameeter_min: row['hinna gr  "võti"'].replace(/,/g, '.').split('-')[0],
      Diameeter_max: row['hinna gr  "võti"'].replace(/,/g, '.').split('-')[1]
    }, '_id'))._id || null

    if (result) return result
  } catch (error) {}
}

exports.create = (req, res, next) => {
  const new_product_data = req.body

  Product.create(new_product_data, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.status(201).json(respondWith('accept', 'Kirje loodud', doc._id))
  })
}

exports.update = async (req, res, next) => {
  const _id = {_id: mongoose.Types.ObjectId(req.params.id)}, update_data = req.body,
    old_product_data = (await Product.findOne(_id, {}, {lean: true})),
    new_product_data = Object.assign({}, old_product_data, {_id}, update_data),
    update = {'$set': new_product_data}

  Product.findOneAndUpdate(_id, new_product_data, {new: true, lean: true}, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.json(respondWith('accept', 'Kirje muudetud', doc))
  })
}

exports.makeAnOffer = async (req, res, next) => {
  const { region,
          plantation,
          brushClearing,
          timberTransport,
          clientIncome,
          property } = req.body

  const newProperty = await Property.create(property)

  const allProducts = await Product.find({ region: {$regex: region, $options: 'i'} }, {}, { lean: true })
  const allProductWithMappedPrices = allProducts.map(product => Object.assign(
      {},
      product,
      { plantation, brushClearing, timberTransport, clientIncome },
      { totalIncome: parseFloat(product.Hind) - (parseFloat(plantation) + parseFloat(brushClearing) + parseFloat(timberTransport) + parseFloat(clientIncome)) }
    ))

  const totalIncome = allProductWithMappedPrices.reduce((total, product) => {
    console.log(total, product.totalIncome)
    return parseFloat(total) + parseFloat(product.totalIncome ? product.totalIncome : 0)
  }, 0)

  const offer = await Offer.create({ prices: allProductWithMappedPrices, propertyId: newProperty._id, totalIncome })

  success(res, offer)
}
