const mongoose = require('mongoose')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const importSchema = mongoose.Schema({
  matched: [],
  unmatched: [],
  veoselehed: [],
  status: String,
  date: Date
})

const importModel = mongoose.model('import', importSchema)

const newDoc = (d)=>{
  let doc = new importModel({
    matched: d.matched,
    unmatched: d.unmatched,
    veoselehed: d.veoselehed,
    status: d.status,
    date: Date.now()
  })
  return doc.save()
}

const updateDoc = (d)=>{
  let conditions = {'unmatched': {$elemMatch:{_id: d._id}}}
  let update = {'$set': {'unmatched.$': d}}
  return importModel.update(conditions, update)
}

const fetchCargoPages = (cadastreID)=>{
  console.log("going to mongo: ",cadastreID)
  //return importModel.find({'veoselehed.$':{{'cadastre': cadastreID})
  //return importModel.find({'veoselehed': {$elemMatch:{cadastre: cadastreID}}})
  return importModel.findOne({'veoselehed.cadastre': cadastreID})
}

const retrieve = (id) => {
  console.log(id)
  if(id) {return importModel.find({_id: id})}
  return importModel.find({$or: [{status: "reject"},{status: "pending"}]}, {status: 1}).sort('-date')

  
}

module.exports = {importModel, newDoc, retrieve, updateDoc, fetchCargoPages}

