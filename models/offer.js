'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')
const Product = require('./product')

const schema = mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, required: 'property id is required' },
    prices: { type: Product },
    totalIncome: Number
  },
  {
    timestamps: true
  }
)

schema.post('save', postSaveHook)

module.exports = mongoose.model('offer', schema)
