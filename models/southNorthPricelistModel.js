const mongoose = require('mongoose'),
north = require('./northPricelistModel.js'),
pricelistSchema = north.pricelistSchema
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const southNorthPricelistModel = mongoose.model('southnorth_price', pricelistSchema)

const insert = (data) => {
  let row = new southNorthPricelistModel({ 
    Sihtkoht: data.Sihtkoht,
    Puuliik: data.Puuliik,
    Sortiment: data.Sortiment,
    Diameeter_min: data.Diameeter_min,
    Diameeter_max: data.Diameeter_max,
    Pikkus_min: data.Pikkus_min,
    Pikkus_max: data.Pikkus_max,
    Kvaliteet: data.Kvaliteet,
    Hind: data.Hind,
    Ylestootamine: data.Ylestootamine,
    Vosatood: data.Vosatood,
    Vedu: data.Vedu,
    Tasu: data.Tasu,
    Tulu: data.Tulu
  })
  return row.save()
}

// Puuliik, Kvaliteet, Diameeter_min, Diameeter_max, Pikkus_min, Pikkus_max

const returnDistinct = k => {
  return southNorthPricelistModel.find().distinct(k)
}

const returnTemplate = () => {
  return southNorthPricelistModel.find({})
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

module.exports = {southNorthPricelistModel, insert, checkForMatch, returnDistinct, returnTemplate}

