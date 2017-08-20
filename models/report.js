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

const report = mongoose.model('import', schema)

const insert = entry => new report(entry).save()

const findById = id => report.findOne({
  $or: [
    {_id: mongoose.Types.ObjectId(id)},
    {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(id)}}}
  ]
})

const updateWholeDoc = d => {
  return report.findOneAndUpdate({_id: d.id}, d, {new: true})
}

const updateDoc = async (rowId, data) => {
  try {
    const conditions = {'unmatched': {$elemMatch:{_id: mongoose.Types.ObjectId(rowId)}}},
    fields = {'unmatched.$' : 1},
    old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = mongoose.Types.ObjectId(rowId),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$' : _new}}

    return (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))
  } catch (error) {
    return new Error(error)
  }
}

const fetchCargoPages = cadastreId => report.find({'veoselehed.cadastre': {$in: cadastreId}})

const retrieve = id => {
  console.log(id)
  if(id) return report.findOne({_id: id})
  return report.find({$or: [{status: "reject"},{status: "pending"}]}, {status: 1, filename: 1}).sort('-date')


}

module.exports = {report, insert, retrieve, updateDoc, fetchCargoPages, findById, updateWholeDoc}

