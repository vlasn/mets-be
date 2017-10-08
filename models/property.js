'use strict'

const mongoose = require('mongoose'),
  schema = mongoose.Schema({
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
  }, 
  {
    timestamps: true
  })

schema.post('save', (err, doc, next) => {
  err.status = 400 
  next(err)
})

module.exports = mongoose.model('property', schema)

