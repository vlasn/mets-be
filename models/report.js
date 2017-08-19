'use strict'

const mongoose = require('mongoose'),
parse = require('../utils/parse.js'),
schema = mongoose.Schema({
  testSum: Number,
  matched: [],
  unmatched: [],
  veoselehed: [],
  status: {type: String, required: true},
  date: {type: Date, default: new Date()},
  filename: {type: String, required: true}
})

const importModel = mongoose.model('import', schema)

const insert = entry => new importModel(entry).save()

const findById = id => importModel.findById(id)

const updateWholeDoc = d => {
  return importModel.findOneAndUpdate({_id: d.id}, d, {new: true})
}

const updateDoc = async (rowId, data) => {
  try {
    const conditions = {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(rowId)}}},
    fields = {'unmatched.$' : 1},
    old = (await importModel.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = mongoose.Types.ObjectId(rowId),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$' : _new}}

    return (await importModel.findOneAndUpdate(conditions, update, {new: true}))
  } catch (error) {
    return new Error(error)
  }
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

module.exports = {importModel, insert, retrieve, updateDoc, fetchCargoPages, findById, updateWholeDoc}

