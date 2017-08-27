'use strict'

const mongoose = require('mongoose'),
{match} = require('../controllers/product.js')

module.exports = async old => {
  const [rows] = [Object.assign({}, old.unmatched)],
  matched = old.matched ? [...old.matched] : [],
  _new = Object.assign({}, old, {matched, unmatched : []}, {status: 'pending'})

  for (const [key, value] of Object.entries(rows)) {
    if (!value.hasOwnProperty('_id')) value._id = mongoose.Types.ObjectId()

    const foundMatch = await match(value)

    if (foundMatch) {
      const vaste = foundMatch
      _new.matched = [Object.assign({vaste}, value), ..._new.matched]
    } else _new.unmatched = [value, ..._new.unmatched]
  }

  return _new
}