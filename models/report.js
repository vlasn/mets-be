'use strict'
const postSaveHook = require('../utils/modelPostSaveHook')

const mongoose = require('mongoose')
const schema = mongoose.Schema({
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

schema.post('save', postSaveHook)

module.exports = mongoose.model('import', schema)
