'use strict'

const router = require('express').Router(),
user = require('./../controllers/user.js')

router.post('/', (req, res, next) => {
  Object.keys(req.body).length
  ? user.create(req, res, next)
  : next('Some request parameters were missing')
})

router.get('/:email', (req, res, next) => {
  req.params.email.length > 2
  ? user.findByEmail(req, res, next)
  : next('Passed parameter too short')
})

module.exports = router