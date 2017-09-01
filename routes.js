'use strict'

const router = require('express').Router(),
user = require('./controllers/user'),
contract = require('./controllers/contract'),
product = require('./controllers/product'),
{uploadDocuments} = require('./utils/upload.js'),
report = require('./controllers/report'),
fileUpload = require('express-fileupload')

// routes that do not require token authentication
//
router.post('/auth/login', user.login)
router.post('/auth/forgot', user.forgot)
router.put('/auth/validate/:hash', user.validate)

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)

router.post('/user/create', user.create)
router.get('/user/:user_id', user.findById)
// WIP
// router.put('/user/:user_id', user.update)
router.get('/users/search', user.search)
router.post('/contract/create', uploadDocuments, contract.create)
router.get('/contract/:contract_id', contract.findById)
// WIP
router.put('/contract/:contract_id', contract.update)
router.get('/contracts/filter', contract.filter)
router.put('/contract/:contract_id/:document_type', fileUpload(), contract.uploadSingleDocument)

router.post('/product/create', product.create)
router.get('/products', product.find)
router.put('/product/:id', product.update)
// WIP
// router.post('/products/snapshot', product.returnTemplate)
router.post('/product/match', product.match)

router.post('/report/create', fileUpload(), report.create)
router.get('/report/:report_id', report.findById)
router.get('/reports', report.find)
router.put('/report/:report_id/row/:row_id', report.update)

router.get('/cargopages/:cadastre_id', report.findCargoPages)

module.exports = router