'use strict'

const mongoose = require('mongoose'),
Contract = require('../models/contract'),
respondWith = require('../utils/response'),
ObjectId = require('mongoose').Types.ObjectId,
path = require('path'),
{ERROR_MISSING_REQUIRED_PARAMS,
ERROR_MONGODB_QUERY_FAILED} = require('../constants')

exports.create = (req, res, next) => {
  if (!req.files || !Object.keys(req.body).length) return next()

  const muu = req.files.muu ? req.files.muu.map(r => r.filename) : [],
  leping = req.files.leping ? req.files['leping'].map(r => r.filename) : [],
  metsateatis = req.files.metsateatis ? req.files['metsateatis'].map(r => r.filename) : []

  req.body.documents = {muu, leping, metsateatis}

  Contract.create(req.body, (err, doc) => {
    if (err) return next(err)
    res.status(201).json(respondWith('accept', 'success', doc))
  })
}

exports.findById = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await Contract.findById(req.params.contract_id).populate({path: 'esindajad', select: 'personal_data -_id'})))
  } catch (e) {
    res.status(204).end()
  }
}

exports.update = async (req, res, next) => {
  try {
    const {contract_id} = req.params,
    update_data = Object.keys(req.body).length ? Object.assign({}, req.body) : null

    if (update_data && mongoose.Types.ObjectId.isValid(contract_id)) {
      const old_data = await Contract.findById(contract_id, {_id: 0}, {lean: true}),
      new_data = Object.assign({}, old_data, update_data),
      result = await Contract.findByIdAndUpdate(contract_id, new_data, {new: true, lean: true})
      res.status(200).json(respondWith('accept', 'updated', result))
    } else throw new _Error('failure', 400)
  } catch (e) {next(e)}
}

exports.filter = (req, res, next) => {
  Contract.find({
    $or: [
      {'kinnistu.nimi': {$regex: req.query.cadastre || ''}},
      {'kinnistu.katastritunnused': { $regex: req.query.cadastre || '' }}
    ],
    metsameister: {$regex: req.query.metsameister || ''},
    status: {$regex: req.query.status || ''}
  }, (err, doc) => {
    if (err) return next(err)
    res.status(200).json(respondWith('accept', '', doc))
  })
}

exports.uploadSingleDocument = (req, res, next)=>{
  try {
    const {contract_id = null, document_type = null} = req.params || {},
    {file = null} = req.files || {}

    if (!(contract_id && document_type && file) || (document_type !== 'muu' &&
    document_type !== 'leping' && document_type !== 'metsateatis')) throw ERROR_MISSING_REQUIRED_PARAMS
    
    const {name} = file, extname = path.extname(name)

    let uniqName = name.split('.').shift() + '_' + Date.now() + extname

    let location = path.resolve(__dirname, `../uploaded_files/${uniqName}`)

    file.mv(location, async error => {
      if (error) throw error

      const item = {}, update = {$push: item}
      item[`documents.${document_type}`] = uniqName

      Contract.findOneAndUpdate({_id: ObjectId(contract_id)}, update, {new: true}, (err, doc) => {
        if (err) return next(err)
        res.status(200).json(respondWith('accept', 'Document added', doc))
      })
    })
  } catch (e) {return next(e)} 
}