'use strict'

const router = require('express').Router(),
user = require('../controllers/user')

router.post(`/login`, user.login)

router.post(`/forgot`, user.forgotPassword)

router.post(`validate`, user.validate)

router.get(`/:hash`, (req, res, next) => {
  req.params.hash
  ? user.verifyHash(req, res, next)
  : next(new Error('Missing GET hash parameter'))
})

module.exports = router