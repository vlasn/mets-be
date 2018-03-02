'use strict'

const router = require('express').Router()
const userController = require('./user')
const authController = require('./auth')
const contractController = require('./contract')
const product = require('./product')
// const report = require('./report')
// const fileUpload = require('express-fileupload')
const {isValid} = require('mongoose').Types.ObjectId
const error = require('../utils/error')
const uploadMiddleware = require('../utils/uploadMiddleware')
const asyncMiddleware = require('../utils/asyncMiddleware')
const user = require('../models/user')
const contract = require('../models/contract')

const mapResourceToModel = {
  contracts: contract,
  users: user
}

const validateEntity = async (req, res, next) => {
  const resourceId = req.params.id
  const resource = req.path.split('/')[1]
  const model = mapResourceToModel[resource]

  resourceId
    ? isValid(resourceId) && await model.findById(resourceId).lean()
      ? next()
      : error(404, `Invalid parameter id: ${resourceId}`)
    : next()
}

router.post('/auth/login', asyncMiddleware(authController.login))
router.post('/auth/forgot_password', asyncMiddleware(authController.forgot_password))
router.put('/auth/validate/:hash', asyncMiddleware(authController.validate))

router.route('/users/:id*?')
  .all(asyncMiddleware(validateEntity))
  .post(asyncMiddleware(userController.POST))
  .get(asyncMiddleware(userController.GET))
  .put(asyncMiddleware(userController.PUT))

router.route('/contracts/:id*?')
  .all(asyncMiddleware(validateEntity))
  .all(asyncMiddleware(contractController.validateId))
  .post(uploadMiddleware, contractController.POST)    // create a contract
  .get(asyncMiddleware(contractController.GET))    // fetch contract data
  .put(contractController.PUT)    // update contract data
// router.put('/contracts/:contract_id/:document_type', fileUpload(), contractController.uploadSingleDocument)

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
