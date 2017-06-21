const mongoose = require('mongoose')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const pricelistSchema = mongoose.Schema({
    Sihtkoht: {type: String, required: true},
    Puuliik: {type: String, required: true},
    Sortiment: {type: String, required: true},
    Diameeter_min: {type: Number, required: true},
    Diameeter_max: {type: Number, required: true},
    Pikkus_min: {type: Number, required: true},
    Pikkus_max: {type: Number, required: true},
    Kvaliteet: {type: String, required: true},
    Hind: {type: Number, required: true},
    Ylestootamine: Number,
    Vosatood: Number,
    Vedu: Number,
    Tasu: Number,
    Tulu: {type: Number}
})

const northPricelistModel = mongoose.model('north_price', pricelistSchema)

const insert = (data) => {
  return northPricelistModel.insertMany(data)
}

const checkForMatch = (incomingRow) => {
  let promise = new Promise((resolve, reject)=>{
    northPricelistModel.findOne({
      
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
  pricelistSchema,
	northPricelistModel,
  insert,
  checkForMatch
}

