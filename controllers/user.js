'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../utils/mailer'),
generateHash = require('../utils/hash'),
respondWith = require('../utils/response'),
signTokenWith = require('../utils/token').create

exports.create = async (req, res, next) => {
  try {
    if (!Object.keys(req.body).length) next()

    req.body.hash = {hash: generateHash()}

    const result = await User.create(req.body)
    
    if (!result) return next(new Error('Päring nurjus'))

    sendMagicLinkTo(result.email, result.hash.hash, res)
  } catch (error) {return next(new Error(error))}
}

exports.login = (req, res, next) => {
  const {email, password} = req.body

  if (!email || !password) return next(new Error('Missing required params'))

  User.findOneAndUpdate(
    {'email': email, 'password': password},
    {lastLoginAt: Date.now()},
    {fields: {password: 0, __v: 0, roles: 0, hash: 0}, lean: true},
    (err, doc) => {
      if (err || !doc) return res.status(401).json(respondWith('reject', 'Vale parool või email'))
      const token = signTokenWith({email: doc.email, roles: doc.roles})
      res.json(respondWith('accept', 'OK', Object.assign({token}, doc)))
  })
}

exports.find = (req, res, next) => {
    const {key, value} = req.query

    if (!key || !value) return next(new Error('Missing required params'))

    let keys = req.query.key.split(','),
    val = {$regex: req.query.value, $options: 'i'},
    conditions = []

    for (const key of keys) {
      let q1 = {}, q2 = {}
      q1['personal_data.' + key] = val
      q2[key] = val
      conditions = [q1, q2, ...conditions]
    }

    const q = {$or: conditions}

    User.find(q, (err, doc) => err ? next(err) : res.json(respondWith('accept', 'OK', doc)))
}

exports.verifyHash = (req, res, next) => {
  if (!req.params.hash) next()

  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - 1)

  User.findOne(
    {
      'hash.hash': req.params.hash,
      'hash.created': {$gt: currentDate}
    },
    (err, doc) => {
      err || !doc
      ? next(err = new Error('Räsi ei sobi või aegunud'))
      : res.json(respondWith('accept', 'OK', doc))
    }
  )
}

exports.validate = async (req, res, next) => {
  if (req.body.password !== req.body.cpassword || req.body.hash.length !== 64) {
    return res.status(400).json('Räsi/parool vigane')
  }

  const result = await User.findOneAndUpdate(
    {'hash.hash': req.params.hash, 'hash.created': {$gt: currentDate}},
    {password: password, hash: {validated: Date.now()}},
    {new: true, lean: true}
  )

  if (!result) return next (new Error('Päring nurjus'))

  res.status(200).json(respondWith('accept', 'Konto aktiveeritud', result))

}

exports.forgotPassword = async (req, res, next) => {
  try {
    const hash = generateHash(), email = req.body.email

    if (!email) return next(new Error('Missing required params'))

    const result = await User.findOneAndUpdate(
      {email: email},
      {hash: {hash: hash, created: Date.now()}},
      {new: true, lean: true}
    )

    if (!result) return next (new Error('Päring nurjus'))

    sendMagicLinkTo(result.email, result.hash.hash, res)
  } catch (error) {return next(new Error(error))}
}