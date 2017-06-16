const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const southNorthPricelistModel = mongoose.model('southnorth_price', pricelistSchema)

const insert = (data) => {
  return southNorthPricelistModel.insertMany(data)
}

const checkForMatch = (incomingRow) => {
  let promise = new Promise((resolve, reject)=>{
    southNorthPricelistModel.findOne({
      
      Sihtkoht: incomingRow['Ostja']
/*        tree_species: incomingRow.puuliik,
      quality: incomingRow.kvaliteet*/
      }, '_id')
      .then(doc=>{
        if(doc) {
          incomingRow.vaste = doc._id
          return resolve(incomingRow)
        }
        resolve(false)
      })
      .catch(err=>{
        console.log(err)
        resolve(false)
      })
  })
  // tagastab selle boolean väärtuse millega promise resolviti
  return promise
}

module.exports = {southNorthPricelistModel, insert, checkForMatch}

