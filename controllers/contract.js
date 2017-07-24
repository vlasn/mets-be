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