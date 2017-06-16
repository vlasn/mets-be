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

const newDoc = (imported_doc)=>{
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
  let conditions = {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(doc.row_id)}}}
  let update = {'$set': {'unmatched.$': doc.new}}
  return importModel.findOneAndUpdate(conditions, update, {new: true})
}



const retrieve = ()=>{
  return importModel.find({}).sort('-date')
}

module.exports = {importModel, newDoc, retrieve, updateDoc}

