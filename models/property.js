'use strict'

const mongoose = require('mongoose')
const { VALIDATION_ERROR,
    DUPLICATION_ERROR,
    DATABASE_ERROR } = require('../errors')
const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: 'property name is required'
    },
    cadastreIds: {
      type: [String],
      required: 'cadastre identifier is required'
    },
    location: {
      type: String
    }
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

module.exports = mongoose.model('property', schema)
