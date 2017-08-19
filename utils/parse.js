'use strict'

const mongoose = require('mongoose'),
findMatchFor = require('./../models/southNorthPricelistModel.js').checkAndApplyMatch,
destructure = require('./destructure')

module.exports = async old => {
  const [rows] = [Object.assign({}, old.unmatched)],
  matches = old.matched ? [...old.matched] : [],
  _new = Object.assign({}, old, {'unmatched' : [], 'matched' : matches})

  for (const [key, value] of Object.entries(rows)) {
    const foundMatch = await findMatchFor(value)

    if (foundMatch) {
      const vaste = foundMatch
      _new.matched = [Object.assign({vaste}, value), ..._new.matched]
    } else _new.unmatched = [Object.assign({vaste}), ..._new.unmatched]
  }

  return _new
}