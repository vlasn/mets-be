'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')

const schema = mongoose.Schema(
  {
    region: { type: String, required: 'region is a required field' },
    destination: { type: String, required: 'destination is a required field' },
    treeType: { type: String, required: 'treeType is a required field' },
    sortiment: { type: String, required: 'sortiment is a required field' },
    diameterMin: { type: Number, required: 'diameterMin is a required field' },
    diameterMax: { type: Number, diameterMax: 'treeType is a required field' },
    lengthMin: { type: Number, required: 'lengthMin is a required field' },
    lengthMax: { type: Number, required: 'lengthMax is a required field' },
    quality: { type: String, required: 'quality is a required field' },
    price: { type: Number, required: 'price is a required field' },
    plantation: Number,
    brushClearing: Number,
    timberTransport: Number,
    income: Number,
    clientIncome: Number
  },
  {
    timestamps: true
  }
)

schema.post('save', postSaveHook)

exports.model = mongoose.model('product', schema)
exports.schema = schema
