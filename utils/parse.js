'use strict'

const mongoose = require('mongoose'),
findProductReference = require('../controllers/pricelist.js').findProductReferenceId

module.exports = async old => {
  const [rows] = [Object.assign({}, old.unmatched)],
  matched = old.matched ? [...old.matched] : [],
  _new = Object.assign({}, old, {matched, unmatched : []})

  for (const [key, value] of Object.entries(rows)) {
    const foundMatch = await findProductReference(value)

    if (foundMatch) {
      const vaste = foundMatch
      _new.matched = [Object.assign({vaste}, value), ..._new.matched]
    } else _new.unmatched = [value, ..._new.unmatched]
  }

  return _new
}