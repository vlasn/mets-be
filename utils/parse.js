'use strict'

const mongoose = require('mongoose'),
{match} = require('../controllers/product.js')

module.exports = async old => {
  if (!old.unmatched.length) return old
  if (!old.lastParsedCount) old.lastParsedCount = 0
  
  const rows = [...old.unmatched],
  matched = old.matched ? [...old.matched] : [], unmatched = [],
  _new = Object.assign({}, old, {matched, unmatched}, {status: 'pending'})

  for (const row of rows) {
    if (!row.hasOwnProperty('_id')) row._id = mongoose.Types.ObjectId()
    const vaste = await match(row); 
    if (vaste) {
      _new.matched = [Object.assign({vaste}, row), ..._new.matched]
      _new.lastParsedAt = new Date() 
      _new.lastParsedCount += 1
    } else _new.unmatched = [row, ..._new.unmatched]
  }

  return _new
}