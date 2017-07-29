'use strict'

const router = require('express').Router(),
User = require('./../controllers/user.js'),
respondWith = require('../util/response')

router.post('/', (req, res, next) => {
  Object.keys(req.body).length
  ? User.create(req, res, next)
  : res.status(400).json(respondWith('reject', 'Some request parameters were missing'))
})

router.get('/:email', (req, res, next) => {
  req.params.email.length > 2
  ? User.findByEmail(req, res, next)
  : res.status(400).json(respondWith('reject', 'Passed parameter too short'))
})

module.exports = router