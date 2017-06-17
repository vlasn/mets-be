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
  let conditions = {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(d.new._id)}}}
  let update = {'$set': {'unmatched.$': d.new}}
  return importModel.findOneAndUpdate(conditions, update, {new: true})
}

const retrieve = () => {return importModel.find({}).sort('-date')}

module.exports = {importModel, newDoc, retrieve, updateDoc}

