'use strict'

const router = require('express').Router(),
user = require('./controllers/user'),
contract = require('./controllers/contract'),
pricelist = require('./controllers/pricelist'),
{uploadDocuments} = require('./utils/upload.js'),
report = require('./controllers/report'),
fileUpload = require('express-fileupload')

// routes that do not require token authentication
//
router.post('/auth/login', user.login)
router.post('/auth/forgot', user.forgotPassword)
router.put('/auth/validate/:hash', user.validate)

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)

router.post('/user/create', user.create)
router.get('/user/:user_id', user.findById)
router.get('/users/search', user.search)

router.post('/contracts', uploadDocuments, contract.post)
router.get('/contract/:contract_id', contract.get)
router.put('/contract/:contract_id/document', fileUpload(), contract.upload_single_document)

router.post('/pricelists', pricelist.addProduct)
router.post('/pricelists/find', pricelist.findProductReferenceId)
router.put('/pricelists/:id', pricelist.updateProduct)
router.post('/pricelists/snapshot', pricelist.returnTemplate)

router.post('/reports', fileUpload(), report.post)
router.put('/reports/rows/:report_row_id', report.update)
router.get('/reports/:id', report.get)



module.exports = router