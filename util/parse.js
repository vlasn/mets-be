'use strict'

const mongoose = require('mongoose'),
pricelist = require('./../models/southNorthPricelistModel.js'),
destructure = require('./destructure')

module.exports = d => {
  if (!d.hasOwnProperty('matched')) d.matched = []

  d.veoselehed = []
  d.status = 'pending'
  d.testSum = 0
  let promises = []

  for (let row of d.unmatched) {
    if (!row.hasOwnProperty('_id')) row._id = mongoose.Types.ObjectId()
    let promise = pricelist.checkForMatch(row)
    .then(result => {
      if (result) {
        let index = d.unmatched.indexOf(row)
        d.unmatched.splice(index,1)
        d.testSum += parseFloat(row['arvestus maht']) * parseFloat(row['Hind'])
        d.matched.push(result)
      }
    })
    promises.push(promise)
  }

  return Promise.all(promises)
  .then(() => {
    if (d.unmatched.length == 0 && d.matched.length > 0) {
      d.status = 'finished'
      return destructure(d)
    }
    return d
  })
}
