'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [1, 'cadastre name can\'t be empty'],
      required: 'property name is required'
    },
    cadastreIds: {
      type: [String],
      minLength: [1, 'cadastre identifier can\'t be empty'],
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
