'use strict'

const User = require('../models/user'),
  respondWith = require('../utils/response'),
  signTokenWith = require('../utils/token').create,
  success = require('../utils/respond'),
  asyncMiddleware = require('../utils/asyncMiddleware'),
  sendMagicLinkTo = require('../utils/mailer'),
  { USER_AUTHENTICATION_ERROR,
    USER_VALIDATION_ERROR,
    MISSING_PARAMS_ERROR } = require('../errors'),
  { ObjectId } = require('mongoose').Types

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
      { fields: {  __v: 0, hash: 0 }, lean: true })

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
    },
    { query: queryString } = req,
    queryStringKeys = Object.keys(queryString)

  const conditions = queryStringKeys
    .filter(key => queryString[key] && searchableFields[key])
    .reduce((conditions, key) => {
      const condition = {}

      condition[searchableFields[key]] = { $regex: queryString[key], $options: 'i' }
      
      conditions.push(condition)
      
      return conditions
    }, [])

  if (!conditions.length) throw MISSING_PARAMS_ERROR

  const result = await User.find({ $or: conditions })

  success(res, result)
})

exports.findOne = asyncMiddleware(async (req, res, next) => {
  if (!ObjectId.isValid(req.params.userId)) throw MISSING_PARAMS_ERROR

  success(res, await User.findById(req.params.userId))
})

exports.validate = asyncMiddleware(async (req, res, next) => {
  const now = new Date(),
    twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString(),
    { hash } = req.params,
    { password } = req.body

  if (!(hash && password)) throw MISSING_PARAMS_ERROR

  const conditions = {
      'hash.hash': hash,
      'hash.createdAt': { $gt: new Date(twentyFourHoursAgo) }
    },
    update = {
      password: password,
      hash: { validatedAt: new Date() }
    },
    options = { new: true, lean: true },
    result = await User.findOneAndUpdate(conditions, update, options)

  if (!result) throw USER_VALIDATION_ERROR()

  success(res, result)
})

exports.forgot = asyncMiddleware(async (req, res, next) => {
  const { email = null } = req.body

  if (!email) throw MISSING_REQUIRED_PARAMS

  const conditions = { email },
    user = await User.findOne(conditions)

  if (!user) throw new Error(`user with email ${email} does not exist`)

  sendMagicLinkTo(user, res, next)
})

exports.update = asyncMiddleware(async (req, res, next) => {
  const { userId = null } = req.params

  if (!ObjectId.isValid(userId)) throw MISSING_PARAMS_ERROR

  // WIP – below is wrong code but for inspiration
  // const data = req.body,
  //   conditions = { _id: ObjectId(report_id), 'unmatched': {$elemMatch: {_id: ObjectId(row_id)}}},
  //   fields = {'unmatched.$': 1},
  //   old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
  //   _id = ObjectId(row_id),
  //   _new = Object.assign({}, old, {_id}, data),
  //   update = {'$set': {'unmatched.$': _new}},
  //   result = (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))

  // return res.status(201).json(respondWith('accept', 'Kirje muudetud', result))
})
