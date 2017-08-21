'use strict'

const mongoose = require('mongoose'),
schema = mongoose.Schema({
  testSum: Number,
  matched: [],
  unmatched: [],
  veoselehed: [],
  status: {type: String, required: true},
  date: {type: Date, default: new Date()},
  filename: {type: String, required: true}
})

module.exports =  mongoose.model('import', schema)


