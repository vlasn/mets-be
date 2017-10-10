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

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('property', schema)

