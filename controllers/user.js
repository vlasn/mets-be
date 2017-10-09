'use strict'

const User = require('../models/user'),
  respondWith = require('../utils/response'),
  signTokenWith = require('../utils/token').create,
  success = require('../utils/respond'),
  asyncMiddleware = require('../utils/asyncMiddleware'),
  sendMagicLinkTo = require('../utils/mailer'),
  { USER_AUTHENTICATION_ERROR,
    USER_VALIDATION_ERROR,
    MISSING_PARAMS_ERROR } = require('../errors')

exports.create = asyncMiddleware(async (req, res, next) => {
  const user = await User.create(req.body)

  if (user.email) sendMagicLinkTo(user, res, next)
  else success(res, user)
})

exports.login = asyncMiddleware(async (req, res, next) => {
  const { email = null,
          password = null } = req.body

  if (!(email && password)) throw MISSING_PARAMS_ERROR

  const user = await User.findOneAndUpdate(
      req.body,
      { lastLoginAt: new Date() },
      { fields: {
        __v: 0,
        hash: 0
      }, lean: true }
    ),
    loginSuccess = !!user

  if (!loginSuccess) throw USER_AUTHENTICATION_ERROR()

  // const token = signTokenWith({ email: result.email })

  success(res, user)
})

exports.findAll = asyncMiddleware(async (req, res, next) => {
  const { key = null,
          value = null } = req.query

  if (!(key && value)) throw MISSING_PARAMS_ERROR

  let keys = req.query.key.split(','),
    val = {$regex: req.query.value, $options: 'i'},
    conditions = []

  for (const key of keys) {
    let q1 = {}, q2 = {}
    q1[`personalData.` + key] = val
    q2[key] = val
    conditions = [q1, q2, ...conditions]
  }

  const q = {$or: conditions},
    result = await User.find(q)

  if (!result) throw MONGODB_QUERY_FAILED

  res.status(200).json(respondWith('accept', 'success', result))
})

exports.findOne = asyncMiddleware(async (req, res, next) => {
  success(res, await User.findById(req.params.userId))
})

exports.validate = asyncMiddleware(async (req, res, next) => {
  const now = new Date(),
    twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString(),
    { hash } = req.params,
    { password } = req.body

    if (!(hash && password)) throw MISSING_PARAMS_ERROR

    const user = await User.findOneAndUpdate(
      { 'hash.hash': hash,
        'hash.createdAt': {
          $gt: new Date(twentyFourHoursAgo)
        }
      },
      {
        password: password,
          hash: {
          validatedAt: new Date()
        }
      },
      {
        new: true,
        lean: true
      }
    )

  if (!user) throw USER_VALIDATION_ERROR()

  success(res, user)
})

exports.forgot = asyncMiddleware(async (req, res, next) => {
  const hash = generateHash(), {email = null} = req.body || {}

  if (!email) throw MISSING_REQUIRED_PARAMS

  const result = await User.findOneAndUpdate(
    {email: email},
    {hash: {hash: hash, createdAt: new Date()}},
    {new: true, lean: true}
  )

  if (!result) throw MONGODB_QUERY_FAILED

  sendMagicLinkTo(result.email, result.hash.hash, res)
})

exports.update = asyncMiddleware(async (req, res, next) => {
  const {user_id = null} = req.params,
    data = req.body,
    conditions = {_id: ObjectId(report_id), 'unmatched': {$elemMatch: {_id: ObjectId(row_id)}}},
    fields = {'unmatched.$': 1},
    old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = ObjectId(row_id),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$': _new}},
    result = (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))

  return res.status(201).json(respondWith('accept', 'Kirje muudetud', result))
})
