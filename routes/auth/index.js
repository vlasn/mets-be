'use strict'

const router = require('express').Router(),
user = require('../../controllers/user')

router.route('/')
.post((req, res, next) => {
	user.login(req, res, next)
})
.put((req, res, next) => {
	user.forgotPassword(req, res, next)
})
.patch((req, res, next) => {
  user.validate(req, res, next)
})

router.get('/:hash', (req, res, next) => {
  !req.params.hash ? next('Missing hash parameter') : user.verifyHash(req, res, next)
})

module.exports = router