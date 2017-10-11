'use strict'

const mongoose = require('mongoose'),
  Contract = require('../models/contract'),
  User = require('../models/user'),
  Property = require("../models/property"),
  respondWith = require('../utils/response'),
  ObjectId = require('mongoose').Types.ObjectId,
  path = require('path'),
  asyncMiddleware = require('../utils/asyncMiddleware'),
  { MISSING_PARAMS_ERROR } = require('../errors'),
  success = require('../utils/respond')

exports.create = asyncMiddleware(async (req, res, next) => {
  const { files = null, body = null } = req
  
  if (isEmpty(files || body)) throw MISSING_PARAMS_ERROR

  const documents = Object.keys(files).reduce((allDocs, docs) => {
    allDocs[docs] = files[docs].map(fileMapper)

    return allDocs
  }, {})

  const property = await Property.create(body.property)

  const representatives = body.representatives.split(",")

  Object.assign(body, { documents }, { representatives }, { property })

  const contract = await Contract.create(body)
  
  success(res, contract)
})

exports.findById = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await Contract.findById(req.params.contractId).populate({path: 'esindajad', select: 'personal_data -_id'})))
  } catch (e) {
    res.status(204).end()
  }
}

exports.update = async (req, res, next) => {
  const dateKeys = ['logging', 'timberTransport', 'wasteTransport']
  try {
    const {contractId} = req.params,
    update_data = Object.keys(req.body).length ? Object.assign({}, req.body) : null

    if (!(update_data && mongoose.Types.ObjectId.isValid(contractId))) throw new _Error('failure', 400)

    update_data.dates = {}

    Object.keys(req.body)
      .filter(key => dateKeys.indexOf(key) > -1)
      .forEach(key => update_data.dates[key] = req.body[key])

    const old_data = await Contract.findById(contractId, {_id: 0}, {lean: true})
    const new_dates = Object.assign({}, old_data.dates, update_data.dates)

    const new_data = Object.assign({}, old_data, update_data, { dates: new_dates })

    const result = await Contract
      .findByIdAndUpdate(contractId, new_data, {new: true, lean: true})
      .populate("representatives property")

    res.status(200).json(respondWith('accept', 'updated', result))
  } catch (e) {next(e)}
}

exports.contracts = async (req, res, next) => {
  try {
    const { term, status, foreman } = req.query

    const users = await User.find({$or: [{"personalData.idNumber": { $regex: term }}, {"personalData.name": { $regex: term }}]})
    const properties = await Property.find({name: { $regex: term }})
    const userIds = users.map(u => u._id)
    const propertyIds = properties.map(p => p._id)
  
    const results = await Contract
      .find({ 
        status: {$regex: status}, 
        foreman: {$regex: foreman}, 
        property: {$in: propertyIds}, 
        representatives: {$in: userIds} 
      })
      .populate("property representatives")

    res.status(200).json(respondWith('accept', 'success', results))
  } catch (e) {next(e)}
}


exports.uploadSingleDocument = (req, res, next)=>{
  try {
    const {contractId = null, document_type = null} = req.params || {},
    {file = null} = req.files || {}

    if (!(contractId && document_type && file) || (document_type !== 'muu' &&
    document_type !== 'leping' && document_type !== 'metsateatis')) throw MISSING_REQUIRED_PARAMS
    
    const {name} = file, extname = path.extname(name)

    let uniqName = name.split('.').shift() + '_' + Date.now() + extname

    let location = path.resolve(__dirname, `../uploaded_files/${uniqName}`)

    file.mv(location, async error => {
      if (error) throw error

      const item = {}, update = {$push: item}
      item[`documents.${document_type}`] = uniqName

      Contract.findOneAndUpdate({_id: ObjectId(contractId)}, update, {new: true}, (err, doc) => {
        if (err) return next(err)
        res.status(200).json(respondWith('accept', 'Document added', doc))
      })
    })
  } catch (e) {return next(e)} 
}

function fileMapper(file) {
  return {
    fileName: file.filename,
    filePath: 'toDo'
  }
}

const isEmpty = object => !Object.keys(object).length
