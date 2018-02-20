'use strict'

const User = require('../models/user')
const signTokenWith = require('../utils/token').create
const success = require('../utils/respond')
const sendMagicLinkTo = require('../utils/mailer')
const error = require('../utils/error')
const { isValid } = require('mongoose').Types.ObjectId

exports.login = async (req, res, next) => {
  const { email = null, password = null } = req.body

  const user = await User.findOneAndUpdate(
    { email, password },
    { lastLoginAt: new Date() },
    { fields: { __v: 0, hash: 0 }, lean: true })

  if (!user) error(401, 'Authentication failed: E-mail and password don\'t match')

  const token = signTokenWith({ email })

  success(res, { user, token })
}

exports.findByIdAndRemove = async (req, res, next) => {
  const { userId = null } = req.params

  if (!isValid(userId)) error(400, 'invalid userId')

  success(res, await User.findByIdAndRemove(req.params.userId))
}

// exports.validate = async (req, res, next) => {
//   const now = new Date()
//   const twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString()
//   const { hash } = req.params
//   const { password } = req.body

//   if (!(hash && password)) error(400, 'Missing required parameter(s)')

//   const conditions = {
//     'hash.hash': hash,
//     'hash.createdAt': { $gt: new Date(twentyFourHoursAgo) }
//   }
//   const update = {
//     password: password,
//     hash: { validatedAt: new Date() }
//   }
//   const options = { new: true, lean: true }
//   const result = await User.findOneAndUpdate(conditions, update, options)

//   if (!result) error(400, `failed to validate hash ${hash}`)

//   success(res, result)
// }

exports.forgot = async (req, res, next) => {
  const { email = null } = req.body

  if (!email) error(400, 'Missing required parameter: email')

  const conditions = { email }
  const user = await User.findOne(conditions)

  if (!user) error(404, `user with email ${email} does not exist`)

  sendMagicLinkTo(user, res, next)
}

module.exports = {
  GET: async (req, res, next) => {
    let userId = req.params.id
    let result = null

    if (!userId) {
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
        representativeIdNumber: 'personalData.representative.idNumber',
        hash: 'hash.hash'
      }
      const {query: queryString} = req
      const queryStringKeys = Object.keys(queryString)

      const conditions = queryStringKeys
        .filter(key => queryString[key] && searchableFields[key])
        .reduce((conditions, key) => {
          const condition = {}

          condition[searchableFields[key]] = {$regex: queryString[key], $options: 'i'}

          conditions.push(condition)

          return conditions
        }, [])

      const query = conditions.length ? {$or: conditions} : {}

      result = await User.find(query).lean().select('-__v ')
    } else {
      result = await User.findById(userId).lean().select('-__v ')
    }

    success(res, result)
  },
  POST: async (req, res, next) => {
    const user = await User.create(req.body)

    user.email ? sendMagicLinkTo(user, res, next) : success(res, user)
  },
  PUT: async (req, res, next) => {
    const userId = req.params.id
    const update = {$set: req.body}
    const options = {new: true, lean: true}
    const result = await User.findByIdAndUpdate(userId, update, options)

    success(res, result)
  },
  validate: async (req, res, next) => {
    req.params.id
      ? isValid(req.params.id) && await User.findById(req.params.id).lean()
        ? next()
        : error(404, `invalid userId ${req.params.id}`)
      : next()
  }
}
