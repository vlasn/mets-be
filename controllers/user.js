'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../utils/mailer'),
generateHash = require('../utils/hash'),
respondWith = require('../utils/response'),
signTokenWith = require('../utils/token').create,
{MISSING_REQUIRED_PARAMS,
MONGODB_QUERY_FAILED} = require('../constants'),
_Error = require('../utils/error')

exports.create = async (req, res, next) => {
  try {
    const {email = null, personal_data: {nimi = null, aadress = null}} = req.body || {}

    if (!(nimi && aadress)) throw MISSING_REQUIRED_PARAMS

    const hash = {hash: generateHash(), createdAt: new Date()},
    _new = email ? Object.assign({}, req.body, {hash}) : Object.assign({}, req.body)

    const result = await User.create(_new)
    
    if (!result) throw MONGODB_QUERY_FAILED

    if (email) sendMagicLinkTo(result.email, result.hash.hash, res)

    res.status(200).json(respondWith('accept', 'User created', result))
  } catch (e) {return next(e)}
}

exports.login = async (req, res, next) => {
  try {
    const {email = null, password = null} = req.body || {}

    if (!(email && password)) throw MISSING_REQUIRED_PARAMS

    const result = await User.findOneAndUpdate(
      {email, password},
      {lastLoginAt: new Date()},
      {fields: {password: 0, __v: 0, roles: 0, hash: 0}, lean: true}
    )

    if (!result) throw new _Error('Authentication failed', 401)

    const token = signTokenWith({email: result.email})

    res.json(respondWith(`accept`, `Authenticated`, Object.assign({token}, result)))
  } catch (e) {return next(e)}
}

exports.search = async (req, res, next) => {
  try {
    const {key = null, value = null} = req.query || {}

    if (!(key && value)) throw MISSING_REQUIRED_PARAMS

    let keys = req.query.key.split(','),
    val = {$regex: req.query.value, $options: 'i'},
    conditions = []

    for (const key of keys) {
      let q1 = {}, q2 = {}
      q1[`personal_data.` + key] = val
      q2[key] = val
      conditions = [q1, q2, ...conditions]
    }

    const q = {$or: conditions},
    result = await User.find(q)

    if (!result) throw MONGODB_QUERY_FAILED

    res.status(200).json(respondWith('accept', 'success', result))
  } catch (e) {return next(e)}
}

exports.findById = async (req, res, next) => {
  try {
    res.status(200).json(respondWith('accept', 'success', await User.findById(req.params.user_id)))
  } catch (e) {
    res.status(204).end()
  }
}

exports.validate = async (req, res, next) => {
  try {
    const {hash = null} = req.params || {},
    {password = null, cpassword = null} = req.body || {},
    now = new Date(),
    twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString()

    if (!password.length || password.length < 6 || password !== cpassword || hash.length !== 64) {
      throw MISSING_REQUIRED_PARAMS
    }

    const result = await User.findOneAndUpdate
    (
      {'hash.hash': hash, 'hash.createdAt': {$gt: new Date(twentyFourHoursAgo)}},
      {password: password, hash: {validatedAt: new Date()}},
      {new: true, lean: true}
    )

    if (!result) throw new _Error('Validation failed', 400)

    res.status(200).json(respondWith('accept', 'Password updated', result))
  } catch (e) {return next(e)}
}

exports.forgot = async (req, res, next) => {
  try {
    const hash = generateHash(), {email = null} = req.body || {}

    if (!email) throw MISSING_REQUIRED_PARAMS

    const result = await User.findOneAndUpdate(
      {email: email},
      {hash: {hash: hash, createdAt: new Date()}},
      {new: true, lean: true}
    )

    if (!result) throw MONGODB_QUERY_FAILED

    sendMagicLinkTo(result.email, result.hash.hash, res)
  } catch (e) {return next(e)}
}

exports.update = async (req, res, next) => {
  try {
    const {user_id = null} = req.params,
    data = req.body,
    conditions = {_id: ObjectId(report_id), 'unmatched': {$elemMatch:{_id: ObjectId(row_id)}}},
    fields = {'unmatched.$' : 1}, 
    old = (await report.findOne(conditions, fields, {lean: true})).unmatched[0],
    _id = ObjectId(row_id),
    _new = Object.assign({}, old, {_id}, data),
    update = {'$set': {'unmatched.$' : _new}},
    result = (await report.findOneAndUpdate(conditions, update, {new: true, lean: true}))

    return res.status(201).json(respondWith('accept', 'Kirje muudetud', result))
  } catch (error) {next(new Error(error))}
}