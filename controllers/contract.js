'use strict'

const mongoose = require('mongoose'),
Contract = require('../models/contract'),
property = require("./property"),
respondWith = require('../utils/response'),
ObjectId = require('mongoose').Types.ObjectId,
path = require('path')

exports.create = async (req, res, next) => {
  try {
    const {files = null, body = null} = req; if (isEmpty(files || body)) throw MISSING_REQUIRED_PARAMS
    const other = files.other ? files.other.map(r => r.filename) : [],
      contracts = files.contracts ? files.contracts.map(r => r.filename) : [],
      forestNotices = files.forestNotices ? files.forestNotices.map(r => r.filename) : []
    
      const propertyId = await property.create(
        req.body.property.name,
        [req.body.property.cadastreId], 
        ""
      ).then(p => {
        return p._id
      })
    body.representatives = body.representatives.split(",")
    body.property = propertyId
    body.documents = { other, contracts, forestNotices }
    const savedToDb = await Contract.create(body)
    
    res.status(201).json(respondWith('accept', 'success', savedToDb))
  } catch (e) {next(e)}
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

    if (!(update_data && mongoose.Types.ObjectId.isValid(contract_id))) throw new _Error('failure', 400)
    
      const old_data = await Contract.findById(contract_id, {_id: 0}, {lean: true}),
    new_data = Object.assign({}, old_data, update_data),
    result = await Contract.findByIdAndUpdate(contract_id, new_data, {new: true, lean: true})
    res.status(200).json(respondWith('accept', 'updated', result))
  } catch (e) {next(e)}
}

exports.filter = async (req, res, next) => {
  try {
    const q = {}; for (const o of Object.entries(req.query)) {
    if (!!o[1]) {
      switch (o[0]) {
        case 'cadastre':
          q['kinnistu.katastritunnus'] = {$regex: o[1]}
          q['kinnistu.nimi'] = {$regex: o[1]}; break
        case 'metsameister': case 'status':
          q[o[0]] = {$regex: o[1]}; break}}}
    res.status(200).json(respondWith('accept', 'success', await Contract.find(q)))
  } catch (e) {next(e)}
}

exports.uploadSingleDocument = (req, res, next)=>{
  try {
    const {contract_id = null, document_type = null} = req.params || {},
    {file = null} = req.files || {}

    if (!(contract_id && document_type && file) || (document_type !== 'muu' &&
    document_type !== 'leping' && document_type !== 'metsateatis')) throw MISSING_REQUIRED_PARAMS
    
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

const isEmpty = object => !Object.keys(object).length
