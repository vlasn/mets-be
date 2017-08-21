'use strict'

const router = require('express').Router(),
fileUpload = require('express-fileupload'),
xlsxToJson = require('../utils/xlsxToJson'),
report = require('./../models/report.js'),
pricelist = require('./../models/southNorthPricelistModel.js'),
ObjectId = require('mongoose').Types.ObjectId,
path = require('path'),
responseFactory = require('../utils/response'),
parse = require('../utils/parse'),
destructure = require('../utils/destructure'),
secret = process.env.SECRET

// const insert = entry => new report(entry).save()
exports.post = (req, res, next) => {
  try {
    if (!req.files) return next('no files')
    
    const data = req.files ? xlsxToJson(fileName, fileLocation) : null
  } catch (error) {next(error)}
  req.files ? report.updateDoc(req, res, next) : res.status(400).send('No files were uploaded.')
}

exports.get = async (req, res, next)=>{
  try {
    const reportId = req.params.id

    if (!ObjectId.isValid(req.params.id)) next(new Error('Vigane id'))

    const result = await report.findOne({
      $or: [
        {_id: ObjectId(reportId)},
        {'unmatched': {$elemMatch:{_id: ObjectId(reportId)}}}
      ]
    })

    if (!result) return res.status(204).json(responseFactory('reject', 'Kirjet ei leitud'))

    res.send(responseFactory('accept', '', result))
  } catch (error) {next(new Error(error))}
}

exports.put = async (req, res, next) => {
  try {
    const rowId = req.params.id,
    data = req.body,
    conditions = {'unmatched': {$elemMatch:{_id: ObjectId(rowId)}}},
    fields = {'unmatched.$' : 1}, 
    old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = ObjectId(rowId),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$' : _new}},
    result = (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))

    return res.status(201).json(responseFactory('accept', 'Kirje muudetud', result))
  } catch (error) {return new Error(error)}
}

exports.fetchCargoPages = (req, res) => {
  let cadastreID = req.query.cadastreid.split(',')
  console.log(cadastreID)
  //for(c in req.body.cadastreIdentifiers) {cadastreIdentifiers.push(cadastreIdentifiers[c])}
  report.fetchCargoPages(cadastreID)
   .then(docs => {
     let response = docs
     .reduce((acc, val) => acc = [...acc, ...val.veoselehed],[])
     .map(val => val.rows)
     .reduce((acc,val) => [...acc,...val],[])
     .map(row => ({
        price: row['Hind'],
        date: row['veoselehe kuupäev'],
        name: row['Elvise VL nr'],
        volume: row['arvestus maht']
      }))
    console.log(response)
    res.status(200).json(responseFactory("accept", "Siin on stuffi", response))
  })
  .catch(err=>{res.status(500).send(responseFactory("reject", err))})
}

// '/fieldOpts/:fieldKey'
exports.getColumnArray = (req, res) => {
  pricelist.returnDistinct(req.params.fieldKey)
  .then(d=>{
    let r
    if(req.params.fieldKey.includes("Diameeter") || req.params.fieldKey.includes("Pikkus")) {
      r = d.filter((t)=>{return typeof t === 'number'})
    } else {
      r = d
    }
    res.status(200).json(responseFactory("accept", "Siin on stuffi", r))
  })
  .catch(err=>{res.status(500).send(err)})
}
// // LEGACY CODE
// const updateWholeDoc = d => {
//   return report.findOneAndUpdate({_id: d.id}, d, {new: true})
// }

// const fetchCargoPages = cadastreId => report.find({'veoselehed.cadastre': {$in: cadastreId}})

// const retrieve = id => {
//   console.log(id)
//   if(id) return report.findOne({_id: id})
//   return report.find({$or: [{status: "reject"},{status: "pending"}]}, {status: 1, filename: 1}).sort('-date')


// }

const namify = x => x.split(`.`).shift()+`_`+ Date.now() +`.`+extensify(x)
const extensify = x => x.split(`.`).pop()
