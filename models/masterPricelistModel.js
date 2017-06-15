const mongoose = require('mongoose')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const masterPricelistSchema = mongoose.Schema({
  region: String,
  rows: [{
      destination: {type: String, required: true},
      tree_species: {type: String, required: true},
      assortment: {type: String, required: true},
      diameter_min: {type: Number, required: true},
      diameter_max: {type: Number, required: true},
      length_min: {type: Number, required: true},
      length_max: {type: Number, required: true},
      quality: {type: String, required: true},
      euro_per_festmeter: {type: Number, required: true},
      harvesting_price: Number,
      brush_works_price: Number,
      transport_price: Number,
      profit: Number,
      total_price: {type: Number, required: true}
    }]
})

const masterPricelistModel = mongoose.model('masterprice', masterPricelistSchema)

const insert = (data) => {
    return masterPricelistModel.insertMany(data)
}

const checkForMatch = (incomingRow) => {
  let promise = new Promise((resolve, reject)=>{
    masterPricelistModel.findOne({
      
      destination: incomingRow['Ostja'],
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



module.exports = {
	masterPricelistModel,
  insert,
  checkForMatch
}

