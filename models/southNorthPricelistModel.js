const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const southNorthPricelistModel = mongoose.model('southnorth_price', pricelistSchema)

const insert = (data) => {
  return southNorthPricelistModel.insertMany(data)
}

// puuliik, kvaliteet, hinna_gr_võti, pikkus

const returnDistinct = () => {
  return Promise.all([
    southNorthPricelistModel.find().distinct("Puuliik").then(res => { return {'Puuliik': res} }),
    southNorthPricelistModel.find().distinct("Kvaliteet").then(res => { return {'Kvaliteet': res} }),
    southNorthPricelistModel.find().distinct("Diameeter_min").then(res =>{return {'Diameeter_min': res}}),
    southNorthPricelistModel.find().distinct("Diameeter_max").then(res =>{return {'Diameeter_max': res}}),
    southNorthPricelistModel.find().distinct("Pikkus_min").then(res =>{return {'Pikkus_min': res}}),
    southNorthPricelistModel.find().distinct("Pikkus_max").then(res =>{return {'Pikkus_max': res}})
  ])
}

const checkForMatch = (incomingRow) => {
  if(incomingRow['hinna gr  "võti"'] == "praak") {incomingRow['hinna gr  "võti"'] = ""}
  //console.log(x.split('-')[0])
  let promise = new Promise((resolve, reject)=>{
    southNorthPricelistModel.findOne({
      Sihtkoht: {$regex: incomingRow['Ostja']},
      Puuliik: incomingRow['puuliik'],
      Kvaliteet: incomingRow['kvaliteet'],
      Diameeter_min: incomingRow['hinna gr  "võti"'].replace(/,/g,'.').split('-')[0],
      Diameeter_max: incomingRow['hinna gr  "võti"'].replace(/,/g,'.').split('-')[1]
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

module.exports = {southNorthPricelistModel, insert, checkForMatch, returnDistinct}

