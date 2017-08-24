'use strict'

const router = require('express').Router(),
user = require('./controllers/user'),
contract = require('./controllers/contract'),
pricelist = require('./controllers/pricelist'),
upload = require('./utils/contractUpload.js'),
report = require('./controllers/report'),
fileUpload = require('express-fileupload')

// routes that do not require token authentication
//
router.post(`/auth/login`, user.login)
router.post(`/auth/forgot`, user.forgotPassword)
router.post(`/auth/validate`, user.validate)
router.get(`/auth/:hash`, user.verifyHash)

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)

router.post(`/users`, user.create)
router.get('/users', user.find)

router.post('/contracts', upload, contract.post)
router.get('/contracts', contract.get)
// router.put('/contracts', contract.something)

router.post('/pricelists', pricelist.addProduct)
router.post('/pricelists/find', pricelist.findProductReferenceId)
router.put('/pricelists/:id', pricelist.updateProduct)
router.post('/pricelists/snapshot', pricelist.returnTemplate)

router.post('/reports', fileUpload(), report.post)
router.put('/reports/:id', report.put)
router.get('/reports/:id', report.get)



module.exports = router