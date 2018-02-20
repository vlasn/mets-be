'use strict'

const router = require('express').Router()
const user = require('./user')
const contract = require('./contract')
const product = require('./product')
const report = require('./report')
const fileUpload = require('express-fileupload')
const {isValid} = require('mongoose').Types.ObjectId
const error = require('../utils/error')
const uploadMiddleware = require('../utils/uploadMiddleware')
const asyncMiddleware = require('../utils/asyncMiddleware')

// routes that do not require token authentication
router.post('/auth/login', asyncMiddleware(user.login))
router.post('/auth/forgot', asyncMiddleware(user.forgot))
router.put('/auth/validate/:hash', asyncMiddleware(user.validate))

// all routes that require token authentication
// router.use('*', require('./utils/token').verify)
router.route('/users/:id*?')
      .all(asyncMiddleware(user.validate))
      .post(asyncMiddleware(user.POST))
      .get(asyncMiddleware(user.GET))
      .put(asyncMiddleware(user.PUT))

// router.route('/contracts')
//       .post(uploadMiddleware, contract.create)    // create a contract
//       .get(contract.contracts)    // query for contracts

// router.route('/contracts/:contractId')
//       .get(asyncMiddleware(contract.findById))    // fetch contract data
//       .put(contract.update)    // update contract data
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

// const routeSpecificMiddleware = (req, res, next) => {
//   console.log('Route-specific middleware was called!')
//   next()
// }

// const routeMethodSpecificMiddleware = (req, res, next) => {
//   console.log('Route method-specific middleware was called!')
//   next()
// }

// const routerSpecificMiddleware = (req, res, next) => {
//   console.log('Router-specific middleware was called!')
//   next()
// }

// router.use(routerSpecificMiddleware)

// router.param('id', async function (req, res, next, value) {
//   try {
//     isValid(value) && await Todo.findById(value)
//       ? next()
//       : error(400, `id ${value} is invalid`)
//   } catch (error) {
//     next(error)
//   }
// })

// router.route('/todos/:id*?')
//   .all(routeSpecificMiddleware)
//   .get(routeMethodSpecificMiddleware, asyncWrapper(todo.GET))
//   .post(asyncWrapper(todo.POST))
//   .put(asyncWrapper(todo.PUT))
//   .delete(asyncWrapper(todo.DELETE))
//   .patch(asyncWrapper(todo.PATCH))
