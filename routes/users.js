'use strict'

const router = require('express').Router(),
User = require('./../controllers/user.js'),
respondWith = require('../util/response')

router.post('/', (req, res, next) => {
  Object.keys(req.body).length
  ? User.create(req, res, next)
  : res.status(400).json(respondWith('reject', 'Some request parameters were missing'))
})

router.get('/', (req, res, next) => {
  req.query.key && req.query.value
  ? User.find(req, res, next)
  : res.status(400).json(respondWith('reject', 'Check the API son'))
})

module.exports = router