'use strict'

const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema

module.exports = mongoose.model('south_price', pricelistSchema)

