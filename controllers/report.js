'use strict'

const router = require('express').Router(),
fileUpload = require('express-fileupload'),
xlsxToJson = require('../utils/xlsxToJson'),
report = require('../models/report.js'),
product = require('../models/southNorthPricelistModel.js'),
ObjectId = require('mongoose').Types.ObjectId,
path = require('path'),
respondWith = require('../utils/response'),
parse = require('../utils/parse'),
destructure = require('../utils/destructure'),
secret = process.env.SECRET,
{ ERROR_MISSING_REQUIRED_PARAMS,
  ERROR_MONGODB_QUERY_FAILED} = require('../constants'),
_Error = require('../utils/error')

// const insert = entry => new report(entry).save()
exports.create = async (req, res, next) => {
  try {
    const {file = null} = req.files || {}

    if (!file) throw ERROR_MISSING_REQUIRED_PARAMS
    
    const {name} = file, extname = path.extname(name)

    if (extname !== `.xlsx`) throw new _Error(`File not .xlsx`, 400)
    
    let uniqName = name.split(`.xlsx`).shift() + `_` + Date.now() + extname

    let location = path.resolve(__dirname, `../uploaded_files/${uniqName}`)

    file.mv(location, async error => {
      if (error) throw error

      const jsonData = xlsxToJson(location),
      parsedJsonData = await parse(jsonData),
      matched = parsedJsonData ? parsedJsonData.matched.length : null,
      total = parsedJsonData ? matched + parsedJsonData.unmatched.length : null,
      message = `Matched ${matched} out of ${total} rows`

      res.status(200).json(respondWith('accept', message, await report.create(parsedJsonData)))
    })
  } catch (error) {next(error)}
}

exports.find = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await report.find({
      status: {$regex: req.query.status || '', $options: 'i'}
    })))
  } catch (e) {
    console.log(e)
    res.status(204).end()
  }
}

exports.findById = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await report.findById(req.params.report_id)))
  } catch (e) {
    console.log(e)
    res.status(204).end()
  }
}

exports.update = async (req, res, next) => {
  try {
    const {report_id = null, row_id = null} = req.params || {},
    data = req.body,
    conditions = {_id: ObjectId(report_id), 'unmatched': {$elemMatch:{_id: ObjectId(row_id)}}},
    fields = {'unmatched.$' : 1}, 
    old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = ObjectId(row_id),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$' : _new}},
    result = (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))

    return res.status(201).json(respondWith('accept', 'Kirje muudetud', result))
  } catch (error) {next(new Error(error))}
}

exports.findCargoPages = async (req, res, next) => {
  try {
    const {cadastre_id = ''} = req.params

    const result = await report.find(
      {'veoselehed.cadastre': cadastre_id}, {veoselehed: 1}, {lean: true}
    )

    res.status(200).json(respondWith('accept', 'success', result))
  } catch (e) {next(e)}
}

// '/fieldOpts/:fieldKey'
exports.getColumnArray = (req, res) => {
  product.returnDistinct(req.params.fieldKey)
  .then(d=>{
    let r
    if(req.params.fieldKey.includes("Diameeter") || req.params.fieldKey.includes("Pikkus")) {
      r = d.filter((t)=>{return typeof t === 'number'})
    } else {
      r = d
    }
    res.status(200).json(respondWith("accept", "Siin on stuffi", r))
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