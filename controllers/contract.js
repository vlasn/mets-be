'use strict'

const Contract = require('../models/contract'),
respondWith = require('../util/response')

exports.create = (req, res, next) => {
  Contract.create(req.body, (err, doc) => {
    if (err) return next(err)

    res.status(201).json(respondWith('accept', 'Leping loodud', doc))
  })
}

exports.findByEmail = () => {
  Contract.find({'esindajad': { $in: [client_email]}}, (err, doc) => {
    if (err) return next(err)

    res.status(200).json(respondWith('accept', '', doc))
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

exports.fetch = (req, res, next)=>{
  Contract.find({
    $or: [
      {'kinnistu.nimi': {$regex: req.params.cadastre = ''}},
      {'kinnistu.katastritunnused': { $regex: req.params.cadastre = '' }}
    ],
    metsameister: {$regex: req.params.metsameister = ''},
    status: {$regex: req.params.status = ''}
  }, (err, doc) => {
    if (err) return next(err)

    res.status(200).json(respondWith('accept', '', doc))
  })
}

exports.insertById = (contract_id, file_name)=>{
  const conditions = {'_id': contract_id},
  update = {'documents.leping': file_name}

  Contract.findOneAndUpdate(conditions, update, {new: true}, (err, doc) => {
    if (err) return next(err)

    res.status(200).json(respondWith('accept', '', doc))
  })
}