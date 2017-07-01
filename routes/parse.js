const mongoose = require('mongoose')
      pricelist = require('./../models/southNorthPricelistModel.js')
      destructure = require('./destructure')

module.exports = d => {
  if(!d.matched) {d.matched = []}

  d.veoselehed = []
  d.status = "pending"
  let promises = []

  for(let row of d.unmatched){
    if(!row._id) {row._id = mongoose.Types.ObjectId()}
    let promise = pricelist.checkForMatch(row)
    .then(result=>{
      if(result){
        let index = d.unmatched.indexOf(row)
        d.unmatched.splice(index,1)
        d.matched.push(result)
      }
    })
    promises.push(promise)
  }

  return Promise.all(promises)
  .then(()=>{
    if(d.unmatched.length > 0) {d.status = "reject"}
    else if(d.unmatched.length == 0 && d.matched.length > 0){
      return destructure(d)
    }
    return d
  })
}
