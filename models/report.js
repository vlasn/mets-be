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
  })

// schema.post('save', (err, doc, next) => {
//   err.name === 'ValidationError' 
//     ? next(MISSING_REQUIRED_PARAMS) 
//     : next(MONGODB_QUERY_FAILED)
// })

module.exports =  mongoose.model('import', schema)


