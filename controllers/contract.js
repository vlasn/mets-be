'use strict'

const Contract = require('../models/contract')
const User = require('../models/user')
const Property = require('../models/property')
const { ObjectId: { isValid } } = require('mongoose').Types.ObjectId
const path = require('path')
const asyncMiddleware = require('../utils/asyncMiddleware')
const error = require('../utils/error')
const success = require('../utils/respond')

exports.create = asyncMiddleware(async (req, res, next) => {
  const { files = null, body = null } = req

  if (isEmpty(files, body)) error(400, 'payload or files missing')

  const representativesIds = body.representatives && body.representatives
    .split(',')
    .filter(id => isValid(id))

  if (isEmpty(representativesIds)) error(400, 'representatives field is empty or contains invalid user id(s)')

  const documents = getDocuments(files)

  const property = await Property.create(body.property)

  Object.assign(body, { documents }, { representativesIds }, { property })

  const contract = await Contract.create(body)

  success(res, contract)
})

exports.findById = async (req, res, next) => {
  const { contractId = null } = req.params
  if (!isValid(contractId)) error(400, 'invalid contract id')
  success(res, await Contract.findById(contractId).populate({ path: 'representatives', select: 'personal_data -_id' }))
}

exports.update = asyncMiddleware(async (req, res, next) => {
  const { contractId = null } = req.params
  const update = { $set: req.body }

  if (!update || !isValid(contractId)) error(400, 'invalid contract id or empty payload')

  const options = { new: true, lean: true }
  const result = await Contract.findByIdAndUpdate(contractId, update, options)

  success(res, result)
})

exports.contracts = async (req, res, next) => {
  try {
    const {term = '', status = '', foreman = ''} = req.query

    const users = await User.find({
      $or: [
        {'personalData.idNumber': { $regex: term }},
        {'personalData.name': { $regex: term }}
      ]
    })
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

    if (!(contractId && document_type && file) || 
    (document_type !== 'muu' && document_type !== 'leping' && document_type !== 'metsateatis')) {
      error(400, 'Missing required parameter(s)')
    }

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

function getDocuments (files) {
  return Object.keys(files).reduce((allDocs, docs) => {
    allDocs[docs] = files[docs].map(fileMapper)

    return allDocs
  }, {})
}

function fileMapper (file) {
  console.log(file)
  return {
    fileName: file.filename,
    filePath: 'toDo'
  }
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

// module.exports = {
//   GET: async (req, res, next) => res.status(200).json({
//     success: true,
//     data: req.params.id
//       ? await Todo.findById(req.params.id)
//       : await Todo.find({})
//   }),
//   POST: async (req, res, next) => res.status(201).json({
//     success: true,
//     data: await Todo.create(req.body)
//   }),
//   PUT: async (req, res, next) => {
//     const { id } = req.params
//     const update = req.body
//     const options = { new: true, lean: true, runValidators: true }

//     res.status(200).json({
//       success: true,
//       data: await Todo.findByIdAndUpdate(id, update, options)
//     })
//   },
//   DELETE: async (req, res, next) => res.status(200).json({
//     success: true,
//     data: await Todo.findByIdAndRemove(req.params.id)
//   })
// }
