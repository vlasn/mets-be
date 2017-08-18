'use strict'

const mongoose = require('mongoose'),
findMatch = require('./../models/southNorthPricelistModel.js').checkAndApplyMatch,
destructure = require('./destructure')

module.exports = async d => {
  if (!d.hasOwnProperty('matched')) d.matched = []
    
  const u = { 'unmatched' : [] }
  
  for (const [index, value] of d.unmatched.entries()) {
    const match = await findMatch(value)
    if (match) {
      value.vaste = match._id
      d.matched.push(value)
      continue
    } d.unmatched.push(value)
  }

  return Object.assign(d, u)
}
