'use strict'

const User = require('../models/user')
const success = require('../utils/respond')
const sendMagicLinkTo = require('../utils/mailer')
const error = require('../utils/error')
const {isValid} = require('mongoose').Types.ObjectId

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
  // DELETE: async (req, res, next) => {
  //   success(res, await User.findByIdAndRemove(req.params.userId))
  // },
  validate: async (req, res, next) => {
    req.params.id
      ? isValid(req.params.id) && await User.findById(req.params.id).lean()
        ? next()
        : error(404, `invalid userId ${req.params.id}`)
      : next()
  }
}
