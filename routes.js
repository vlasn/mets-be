'use strict'

const router = require('express').Router(),
  user = require('./controllers/user'),
  contract = require('./controllers/contract'),
  product = require('./controllers/product'),
  uploadMiddleware = require('./utils/uploadMiddleware.js'),
  report = require('./controllers/report'),
  fileUpload = require('express-fileupload')

// routes that do not require token authentication
//
router.post('/auth/login', user.login)
router.post('/auth/forgot', user.forgot)
router.put('/auth/validate/:hash', user.validate)

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)

router.post('/users', user.create)
router.get('/users/:userId', user.findOne)
router.get('/users', user.findAll)
router.put('/users/:userId', user.update)

router.post('/contracts', uploadMiddleware, contract.create)    // create a contract
router.get('/contracts/:contractId', contract.findById)    // fetch contract data
router.put('/contracts/:contractId', contract.update)    // update contract data
router.get('/contracts', contract.contracts)    // query for contracts
router.put('/contracts/:contract_id/:document_type', fileUpload(), contract.uploadSingleDocument)

router.post('/product/create', product.create)    // create a product
router.get('/products', product.find)    // query all products
router.put('/product/:id', product.update)    // update product data
// router.post('/products/snapshot', product.returnTemplate)    // create snapshot with POST data
router.post('/product/match', product.match)    // match a product against POST data

router.post('/report/create', fileUpload(), report.create)    // create a report
router.get('/report/:report_id', report.findById)    // fetch report data
router.get('/reports', report.find)    // query for reports
router.put('/report/:report_id/row/:row_id', report.update)    // update report row data
router.put('/report/parse/:report_id', report.parse)    // update report row data

router.get('/cargopages/:cadastre_id', report.findCargoPages)

module.exports = router
