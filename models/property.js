'use strict'

const mongoose = require('mongoose'),
Schema = mongoose.Schema,
schema = mongoose.Schema({
  name: String,
  cadastreIds: [String],
  location: String,
  required: true
},
{
  timestamps: true
})

schema.post('save', (err, doc, next) => {
  err.name === 'ValidationError' ? next(MISSING_REQUIRED_PARAMS) : next(MONGODB_QUERY_FAILED)
})

module.exports = mongoose.model('property', schema)

