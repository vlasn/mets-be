'use strict'

const mongoose = require('mongoose'),
  schema = mongoose.Schema({
    testSum: Number,
    matched: [],
    unmatched: [],
    waybills: [],
    status: {type: String, required: true},
    date: {type: Date, default: new Date()},
    filename: {type: String, required: true}
  },
  {
    timestamps: true
  })

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports =  mongoose.model('import', schema)


