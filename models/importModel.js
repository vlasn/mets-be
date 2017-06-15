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

const insertDoc = (imported_doc)=>{
  let doc = new importModel({
    matched: imported_doc.matched,
    unmatched: imported_doc.unmatched,
    veoselehed: [],
    status: imported_doc.status,
    date: Date.now()
  })
  return doc.save()
}

const updateDoc = (doc)=>{
  let conditions = {_id: doc._id}
  return userModel.findOneAndUpdate(conditions, doc, {new: true})
}

const retrieve = ()=>{
  return importModel.find({}).sort('-date')
}

module.exports = {importModel, insertDoc, retrieve}

