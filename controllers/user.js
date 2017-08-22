'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../utils/mailer'),
generateHash = require('../utils/hash'),
respondWith = require('../utils/response'),
signTokenWith = require('../utils/token').create,
{ ERROR_MISSING_REQUIRED_PARAMS,
  ERROR_MONGODB_QUERY_FAILED} = require('../constants'),
_Error = require('../utils/error')

exports.create = async (req, res, next) => {
  try {
    const {nimi = null, aadress = null} = req.body.personal_data || {},
    {email = null} = req.body || {}

    if (!nimi || !aadress) throw ERROR_MISSING_REQUIRED_PARAMS

    req.body.hash = {hash: generateHash()}

    const result = await User.create(req.body)
    
    if (!result) throw ERROR_MONGODB_QUERY_FAILED

    if (email) sendMagicLinkTo(result.email, result.hash.hash, res)

    res.status(200).json(respondWith(`accept`, `Konto loodud`, result))
  } catch (e) {return next(e)}
}

exports.login = async (req, res, next) => {
  try {
    const {email = null, password = null} = req.body || {}

    if (!email || !password) throw ERROR_MISSING_REQUIRED_PARAMS

    const result = await User.findOneAndUpdate(
      {email, password},
      {lastLoginAt: Date.now()},
      {fields: {password: 0, __v: 0, roles: 0, hash: 0}, lean: true}
    )

    if (!result) throw new _Error(`Authentication failed`, 401)

    const token = signTokenWith({email: result.email})

    res.json(respondWith(`accept`, `Authenticated`, Object.assign({token}, result)))
  } catch (e) {return next(e)}
}

exports.find = async (req, res, next) => {
  try {
    const {key = null, value = null} = req.query || {}

    if (!key || !value) throw ERROR_MISSING_REQUIRED_PARAMS

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

    if (!result) throw ERROR_MONGODB_QUERY_FAILED

    res.status(200).json(respondWith(`accept`, `Leiti konto(d)`, result))
  } catch (e) {return next(e)}
}

exports.verifyHash = async (req, res, next) => {
  try {
    const {hash = null} = req.params || {} 

    if (!hash) throw ERROR_MISSING_REQUIRED_PARAMS

    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 1)

    const result = await User.findOne({'hash.hash': hash, 'hash.created': {$gt: currentDate}})

    if (!result) res.status(200).json(respondWith(`accept`, `Leiti 0 kirjet`))

    res.status(200).json(respondWith(`accept`, `Leiti 1 kirje`, result))

  } catch (e) {return next(e)}
}

exports.validate = async (req, res, next) => {
  try {
    if (req.body.password !== req.body.cpassword || req.body.hash.length !== 64) {
      throw ERROR_MISSING_REQUIRED_PARAMS
    }

    const result = await User.findOneAndUpdate(
      {'hash.hash': req.params.hash, 'hash.created': {$gt: currentDate}},
      {password: password, hash: {validated: Date.now()}},
      {new: true, lean: true}
    )

    if (!result) throw ERROR_MONGODB_QUERY_FAILED

    res.status(200).json(respondWith(`accept`, 'Konto aktiveeritud', result))
  } catch (e) {return next(e)}
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const hash = generateHash(), {email = null} = req.body || {}

    if (!email) throw ERROR_MISSING_REQUIRED_PARAMS

    const result = await User.findOneAndUpdate(
      {email: email},
      {hash: {hash: hash, created: Date.now()}},
      {new: true, lean: true}
    )

    if (!result) throw ERROR_MONGODB_QUERY_FAILED

    sendMagicLinkTo(result.email, result.hash.hash, res)
  } catch (e) {return next(e)}
}