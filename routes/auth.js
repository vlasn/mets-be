'use strict'

const router = require('express').Router(),
user = require('../controllers/user')

router.post(`/login`, (req, res, next) => {
  req.body && req.body.email && req.body.password
  ? user.login(req, res, next)
  : next(new Error('Missing POST parameters'))
})

router.post(`/forgot`, (req, res, next) => {
	user.forgotPassword(req, res, next)
})

router.post(`validate`, (req, res, next) => {
  user.validate(req, res, next)
})

router.get(`/:hash`, (req, res, next) => {
  req.params.hash
  ? user.verifyHash(req, res, next)
  : next(new Error('Missing GET hash parameter'))
})

module.exports = router