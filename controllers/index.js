'use strict'

const router = require('express').Router()
const userController = require('./user')
const authController = require('./auth')
const contractController = require('./contract')
const productController = require('./product')
// const report = require('./report')
// const fileUpload = require('express-fileupload')
const {isValid} = require('mongoose').Types.ObjectId
const error = require('../utils/error')
const uploadMiddleware = require('../utils/uploadMiddleware')
const asyncMiddleware = require('../utils/asyncMiddleware')
const user = require('../models/user')
const contract = require('../models/contract')
const product = require('../models/product')

const mapResourceToModel = {
  contracts: contract,
  users: user,
  products: product
}

const validateResource = async (req, res, next) => {
  const resourceId = req.params.id
  const resource = req.path.split('/')[1]
  const model = mapResourceToModel[resource]
  const isInvalidId = !isValid(resourceId)
  const isNotInDb = !await model.findById(resourceId).lean()

  if (isInvalidId || isNotInDb) {
    error(404, `Invalid parameter id: ${resourceId}`)
  }

  next()
}

router.post('/auth/login', asyncMiddleware(authController.login))
router.post('/auth/forgot_password', asyncMiddleware(authController.forgot_password))
router.put('/auth/validate/:hash', asyncMiddleware(authController.validate))

router.route('/users/:id*?')
  .all(asyncMiddleware(validateResource))
  .post(asyncMiddleware(userController.POST))
  .get(asyncMiddleware(userController.GET))
  .put(asyncMiddleware(userController.PUT))

router.route('/contracts/:id*?')
  .all(asyncMiddleware(validateResource))
  .post(uploadMiddleware, contractController.POST)
  .get(asyncMiddleware(contractController.GET))
  .put(contractController.PUT)
// router.put('/contracts/:contract_id/:document_type', fileUpload(), contractController.uploadSingleDocument)

router.route('/products/:id*?')
  .all(asyncMiddleware(validateResource))
  .post(productController.create)
  .get(productController.find)
  .put(productController.update)

router.route('/offers')
  .post(asyncMiddleware(productController.makeAnOffer))

// routes that are not part of v1
// router.post('/product/match', productController.match)
// router.post('/report/create', fileUpload(), report.create)
// router.get('/report/:report_id', report.findById)
// router.get('/reports', report.find)
// router.put('/report/:report_id/row/:row_id', report.update)
// router.put('/report/parse/:report_id', report.parse)
// router.get('/cargopages/:cadastre_id', report.findCargoPages)

module.exports = router
