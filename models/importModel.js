const mongoose = require('mongoose'),
parse = require('./../routes/parse.js')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const importSchema = mongoose.Schema({
  matched: [],
  unmatched: [],
  veoselehed: [],
  status: String,
  date: Date,
  filename: String
})

const importModel = mongoose.model('import', importSchema)

const newDoc = (d)=>{
  let doc = new importModel({
    matched: d.matched,
    unmatched: d.unmatched,
    veoselehed: d.veoselehed,
    status: d.status,
    date: Date.now(),
    filename: d.filename
  })
  return doc.save()
}

const findById = (id) => {
  return importModel.findById(id)
}

const updateWholeDoc = d => {
  return importModel.findOneAndUpdate({_id: d.id}, d, {new: true})
}

const updateDoc = (d)=>{
  let conditions = {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(d._id)}}}
  let update = {'$set': {'unmatched.$': d}}
  return importModel.findOneAndUpdate(conditions, update, {new: true})
}

const fetchCargoPages = (cadastreID)=>{
  console.log("going to mongo: ",cadastreID)
  //return importModel.find({'veoselehed.$':{{'cadastre': cadastreID})
  //return importModel.find({'veoselehed': {$elemMatch:{cadastre: cadastreID}}})
  //return importModel.findOne({'veoselehed.cadastre': cadastreID})
  return importModel.find({'veoselehed.cadastre': {$in: cadastreID}})
}

const retrieve = (id) => {
  console.log(id)
  if(id) {return importModel.findOne({_id: id})}
  return importModel.find({$or: [{status: "reject"},{status: "pending"}]}, {status: 1}).sort('-date')

  
}

module.exports = {importModel, newDoc, retrieve, updateDoc, fetchCargoPages, findById, updateWholeDoc}

