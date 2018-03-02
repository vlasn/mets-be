'use strict'

const User = require('../models/user')
const signTokenWith = require('../utils/token').create
const success = require('../utils/respond')
const sendMagicLinkTo = require('../utils/mailer')
const error = require('../utils/error')

module.exports = {
  login: async (req, res, next) => {
    const {email = null, password = null} = req.body

    const user = await User.findOneAndUpdate(
      {email, password},
      {lastLoginAt: new Date()},
      {fields: {__v: 0, hash: 0}, lean: true}
    )

    if (!user) error(401, 'Invalid email or password')

    const token = signTokenWith({email})

    success(res, {user, token})
  },
  forgot_password: async (req, res, next) => {
    const {email = null} = req.body

    if (!email) error(400, 'Missing required parameter: email')

    const conditions = {email}
    const user = await User.findOne(conditions)

    if (!user) error(404, `user with email ${email} does not exist`)

    sendMagicLinkTo(user, res, next)
  },
  validate: async (req, res, next) => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getYear(), now.getMonth(), now.getDate() - 1).toISOString()
    const {hash} = req.params
    const {password} = req.body

    if (!(hash && password)) error(400, 'Missing required parameter(s)')

    const conditions = {
      'hash.hash': hash,
      'hash.createdAt': {$gt: new Date(twentyFourHoursAgo)}
    }
    const update = {
      password: password,
      hash: {validatedAt: new Date()}
    }
    const options = {new: true, lean: true}
    const result = await User.findOneAndUpdate(conditions, update, options)

    if (!result) error(400, `failed to validate hash ${hash}`)

    success(res, result)
  }
}
