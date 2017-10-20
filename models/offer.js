'use strict'

const mongoose = require('mongoose')
const { VALIDATION_ERROR,
        DUPLICATION_ERROR,
        DATABASE_ERROR } = require('../errors')
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

schema.post('save', function (err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('offer', schema)
