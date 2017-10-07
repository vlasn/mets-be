'use strict'

const mongoose = require('mongoose')
const {MISSING_REQUIRED_PARAMS,
  MONGODB_QUERY_FAILED} = require('../constants')

const schema = mongoose.Schema({
  name: { 
    type: String,
    required: true 
  },
  cadastreIds: { 
    type: [String],
    required: true 
  },
  location: { 
    type: String   
  }
}, {
  timestamps: true
})

schema.post('save', (err, doc, next) => {
  console.log(err)
  err.name === 'ValidationError' ? next(MISSING_REQUIRED_PARAMS) : next(MONGODB_QUERY_FAILED)
})

module.exports = mongoose.model('property', schema)

