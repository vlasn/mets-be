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

router.post('/user/create', user.create)    // create an user
router.get('/user/:user_id', user.findById)    // fetch user data
router.put('/user/:user_id', user.update)    // update user data
router.get('/users/search', user.search)    // query for users

router.post('/contract/create', uploadDocuments, contract.create)    // create a contract
router.get('/contract/:contract_id', contract.findById)    // fetch contract data
router.put('/contract/:contract_id', contract.update)    // update contract data
router.get('/contracts/filter', contract.filter)    // query for contracts
router.put('/contract/:contract_id/:document_type', fileUpload(), contract.uploadSingleDocument)

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