'use strict'

const User = require('../models/user')
const signTokenWith = require('../utils/token').create
const success = require('../utils/respond')
const asyncMiddleware = require('../utils/asyncMiddleware')
const sendMagicLinkTo = require('../utils/mailer')
const { USER_AUTHENTICATION_ERROR,
    USER_VALIDATION_ERROR,
    MISSING_PARAMS_ERROR } = require('../errors')
const { ObjectId } = require('mongoose').Types

exports.create = asyncMiddleware(async (req, res, next) => {
  const user = await User.create(req.body)

  if (user.email) sendMagicLinkTo(user, res, next)
  else success(res, user)
})

exports.login = asyncMiddleware(async (req, res, next) => {
  const { email = null, password = null } = req.body

  if (!(email && password)) throw MISSING_PARAMS_ERROR

  const user = await User.findOneAndUpdate(
      { email, password },
      { lastLoginAt: new Date() },
      { fields: { __v: 0, hash: 0 }, lean: true })

  if (!user) throw USER_AUTHENTICATION_ERROR()

  const token = signTokenWith({ email })

  success(res, { user, token })
})

exports.findAll = asyncMiddleware(async (req, res, next) => {
  const searchableFields = {
    email: 'email',
    name: 'personalData.name',
    phone: 'personalData.phone',
    address: 'personalData.address',
    idNumber: 'personalData.idNumber',
    documentNumber: 'personalData.documentNumber',
    juridical: 'personalData.juridical',
    companyId: 'personalData.companyId',
    companyName: 'personalData.companyName',
    representativeName: 'personalData.representative.name',
    representativeIdNumber: 'personalData.representative.idNumber'
  }
  const { query: queryString } = req
  const queryStringKeys = Object.keys(queryString)

  const conditions = queryStringKeys
    .filter(key => queryString[key] && searchableFields[key])
    .reduce((conditions, key) => {
      const condition = {}

      condition[searchableFields[key]] = { $regex: queryString[key], $options: 'i' }

      conditions.push(condition)

      return conditions
    }, [])

  const query = conditions.length ? { $or: conditions } : {}

  const result = await User.find(query)

  success(res, result)
})

exports.findOne = asyncMiddleware(async (req, res, next) => {
  if (!ObjectId.isValid(req.params.userId)) throw MISSING_PARAMS_ERROR

  success(res, await User.findById(req.params.userId))
})

exports.validate = asyncMiddleware(async (req, res, next) => {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString()
  const { hash } = req.params
  const { password } = req.body

  if (!(hash && password)) throw MISSING_PARAMS_ERROR

  const conditions = {
    'hash.hash': hash,
    'hash.createdAt': { $gt: new Date(twentyFourHoursAgo) }
  }
  const update = {
    password: password,
    hash: { validatedAt: new Date() }
  }
  const options = { new: true, lean: true }
  const result = await User.findOneAndUpdate(conditions, update, options)

  if (!result) throw USER_VALIDATION_ERROR()

  success(res, result)
})

exports.forgot = asyncMiddleware(async (req, res, next) => {
  const { email = null } = req.body

  if (!email) throw MISSING_PARAMS_ERROR

  const conditions = { email }
  const user = await User.findOne(conditions)

  if (!user) {
    const error = new Error(`user with email ${email} does not exist`)
    error.status = 404
    throw error
  }

  sendMagicLinkTo(user, res, next)
})

exports.update = asyncMiddleware(async (req, res, next) => {
  const { userId = null } = req.params

  if (!ObjectId.isValid(userId)) {
    const error = new Error('invalid user id')
    error.status = 400
    throw error
  }

  const update = { $set: req.body }
  const options = { new: true, lean: true }
  const result = await User.findByIdAndUpdate(userId, update, options)

  if (!result) {
    const error = new Error(`user with id ${userId} does not exist`)
    error.status = 404
    throw error
  }

  success(res, result)
})
