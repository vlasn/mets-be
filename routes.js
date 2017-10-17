'use strict'

const router = require('express').Router(),
  user = require('./controllers/user'),
  contract = require('./controllers/contract'),
  product = require('./controllers/product'),
  uploadMiddleware = require('./utils/uploadMiddleware.js'),
  report = require('./controllers/report'),
  fileUpload = require('express-fileupload'),
  asyncMiddleware = require('./utils/asyncMiddleware')

// routes that do not require token authentication
router.post('/auth/login', user.login)
router.post('/auth/forgot', user.forgot)
router.put('/auth/validate/:hash', user.validate)

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)
router.route('/users')
      .post(user.create)
      .get(user.findAll)

router.route('/users/:userId')
      .get(user.findOne)
      .put(user.update)

router.route('/contracts')
      .post(uploadMiddleware, contract.create)    // create a contract
      .get(contract.contracts)    // query for contracts

router.route('/contracts/:contractId')
      .get(asyncMiddleware(contract.findById))    // fetch contract data
      .put(contract.update)    // update contract data
// router.put('/contracts/:contract_id/:document_type', fileUpload(), contract.uploadSingleDocument)

router.route('/products')
      .post(product.create)    // create a product
      .get(product.find)    // query all products

router.route('/products/:id')
      .put(product.update)    // update product data

router.route('/offers')
      .post(asyncMiddleware(product.makeAnOffer))

// routes that are not part of v1
// router.post('/product/match', product.match)
// router.post('/report/create', fileUpload(), report.create)
// router.get('/report/:report_id', report.findById)
// router.get('/reports', report.find)
// router.put('/report/:report_id/row/:row_id', report.update)
// router.put('/report/parse/:report_id', report.parse)
// router.get('/cargopages/:cadastre_id', report.findCargoPages)

module.exports = router
