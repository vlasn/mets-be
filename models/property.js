'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')

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

schema.post('save', postSaveHook)

module.exports = mongoose.model('property', schema)
