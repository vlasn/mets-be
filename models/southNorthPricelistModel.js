'use strict'

const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema

module.exports = mongoose.model('southnorth_price', pricelistSchema)

