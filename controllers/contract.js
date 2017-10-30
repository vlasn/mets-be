'use strict'

const Contract = require('../models/contract')
const User = require('../models/user')
const Property = require('../models/property')
const ObjectId = require('mongoose').Types.ObjectId
const path = require('path')
const asyncMiddleware = require('../utils/asyncMiddleware')
const { MISSING_PARAMS_ERROR, newError } = require('../errors')
const success = require('../utils/respond')

exports.create = asyncMiddleware(async (req, res, next) => {
  const { files = null, body = null } = req

  if (isEmpty(files, body)) throw newError(400, 'payload or files missing')

  const representatives = body.representatives &&
    body.representatives.split(',').filter(repId => ObjectId.isValid(repId))

  if (isEmpty(representatives)) throw newError(400, 'representatives field is empty or contains invalid user id(s)')

  const documents = getDocuments(files)

  Object.assign(body, { documents }, { representatives }, { property })

  const contract = await Contract.create(body)

  success(res, contract)
})

exports.findById = async (req, res, next) => {
  const { contractId = null } = req.params
  if (!ObjectId.isValid(contractId)) throw newError(400, 'invalid contract id')
  success(res, await Contract.findById(contractId).populate({ path: 'representatives', select: 'personal_data -_id' }))
}

exports.update = asyncMiddleware(async (req, res, next) => {
  const { contractId = null } = req.params
  const update = { $set: req.body }

  if (!update || !ObjectId.isValid(contractId)) throw newError(400, 'invalid contract id or empty payload')

  const options = { new: true, lean: true }
  const result = await Contract.findByIdAndUpdate(contractId, update, options)

  success(res, result)
})

exports.contracts = async (req, res, next) => {
  try {
    const { term, status, foreman } = req.query

    const users = await User.find({$or: [{'personalData.idNumber': { $regex: term }}, {'personalData.name': { $regex: term }}]})
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
      .populate('property representatives')

    success(res, results)
  } catch (e) { next(e) }
}

exports.uploadSingleDocument = (req, res, next) => {
  try {
    const {contractId = null, document_type = null} = req.params || {},
      {file = null} = req.files || {}

    if (!(contractId && document_type && file) || (document_type !== 'muu' &&
    document_type !== 'leping' && document_type !== 'metsateatis')) throw MISSING_PARAMS_ERROR

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
  } catch (e) { return next(e) }
}

function fileMapper (file) {
  return {
    fileName: file.filename,
    filePath: 'toDo'
  }
}

function getDocuments (files) {
  return Object.keys(files).reduce((allDocs, docs) => {
    allDocs[docs] = files[docs].map(fileMapper)

    return allDocs
  }, {})
}

function isEmpty (dataStructure) {
  for (const dataStructure of arguments) {
    if (!dataStructure ||
        (typeof dataStructure === 'object' && !Object.keys(dataStructure).length) ||
        (typeof dataStructure === 'array' && !dataStructure.length)) {
      return true
    }
  }

  return false
}
