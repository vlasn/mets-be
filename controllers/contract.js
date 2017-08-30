'use strict'

const Contract = require('../models/contract'),
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
    res.status(201).json(respondWith('accept', 'Leping loodud', doc))
  })
}

exports.findById = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await Contract.findById(req.params.contract_id)))
  } catch (e) {
    res.status(204).end()
  }
}

exports.update = async (req, res, next) => {
  const _id = {_id: mongoose.Types.ObjectId(req.params.id)}, update_data = req.body,
  old_contract_data = (await Contract.findOne(_id, {}, {lean: true})),
  new_contract_data = Object.assign({}, old_contract_data, {_id}, update_data),
  update = {'$set': new_contract_data}

  Product.findOneAndUpdate(_id, update_data, {new: true, lean: true}, (err, doc) => {
    if (err) return res.status(400).json(respondWith('reject', 'Salvestamisel tekkis viga'))
    res.json(respondWith('accept', 'Kirje muudetud', doc))
  })
}

//very basic, needs
exports.updateContractLine = (id, key, value, remove = false) => {
  /*
    Vajab dates objekti uuendamiseks edasist query-buildingut
   */
  if(key==='katastritunnused'){
    update = {$set : {'kinnistu.katastritunnused': value}}
  } else if(key==='kinnistu') {
    update = {$set: {'kinnistu.nimi': value}}
  } else {
    update = {$set:{[key]:value}}
  }

  console.log(update)

  Contract.findOneAndUpdate({_id: id}, update, {new: true}, (err, doc) => {
    if (err) return next(err)
    res.status(200).json(respondWith('accept', '', doc))
  })
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

exports.insertById = (contract_id, file_name) => {
  const conditions = {'_id': contract_id},
  update = {'documents.leping': file_name}

  Contract.findOneAndUpdate(conditions, update, {new: true}, (err, doc) => {
    if (err) return next(err)
    res.status(200).json(respondWith('accept', '', doc))
  })
}

exports.something = (req, res, next) => {
  let id = req.params.id
  let key = req.body.key
  let value = req.body.value
  let remove = !!req.body.remove
  contract.updateContractLine(id, key, value, remove)
  .then(d => {
    if(!d || d === null) {
      console.log(`Couldn't find document ${id} to update.`)
      res.status(500).json(respondWith('reject','Kirjet ei leitud!'))
    } else {
      console.log(`${key} of document ${id} is now ${value}`)
      res.status(200).json(respondWith('accept','ok',d))
    }
  })
  .catch(e => {
    console.log(e)
    res.status(500).json(respondWith('reject', '', e))
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