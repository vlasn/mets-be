const mongoose = require('mongoose'),
parse = require('./../routes/parse.js')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const schema = mongoose.Schema({
  testSum: Number,
  matched: [],
  unmatched: [],
  veoselehed: [],
  status: String,
  date: Date,
  filename: String
})

const importModel = mongoose.model('import', schema)

const newDoc = (d)=>{
  let doc = new importModel({
    testSum: d.testSum,
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
  d._id = mongoose.Types.ObjectId(d._id)
  let conditions = {'unmatched': {$elemMatch:{_id: d._id}}}
      update = {'$set': {'unmatched.$': d}}
  return importModel.findOneAndUpdate(conditions, update, {new: true})
}

const fetchCargoPages = cadastreId => {
  console.log("going to mongo: ",cadastreId)
  //return importModel.find({'veoselehed.$':{{'cadastre': cadastreId})
  //return importModel.find({'veoselehed': {$elemMatch:{cadastre: cadastreId}}})
  //return importModel.findOne({'veoselehed.cadastre': cadastreId})
  return importModel.find({'veoselehed.cadastre': {$in: cadastreId}})
}

const retrieve = id => {
  console.log(id)
  if(id) return importModel.findOne({_id: id})
  return importModel.find({$or: [{status: "reject"},{status: "pending"}]}, {status: 1, filename: 1}).sort('-date')

  
}

module.exports = {importModel, newDoc, retrieve, updateDoc, fetchCargoPages, findById, updateWholeDoc}

