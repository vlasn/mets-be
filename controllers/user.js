'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../utils/mailer'),
generateHash = require('../utils/hash'),
respondWith = require('../utils/response'),
signTokenWith = require('../utils/token').create

exports.create = (req, res, next) => {
  if (!Object.keys(req.body).length) next()

  req.body.hash = {hash: generateHash()}

  User.create(req.body, (err, doc) => {
    if (err) return next(err)

    sendMagicLinkTo(doc.email, doc.hash.hash, (err, ok) => {
      if (err) return next(new Error('Aktiveerimislinki ei saadetud – kontakteeru bossiga'))
      res.status(201).json(respondWith('accept', `Aktiveerimislink saadeti meiliaadressile ${doc.email}`))
    })
  })
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

exports.validate = (req, res, next) => {
  if (req.body.password !== req.body.cpassword || req.body.hash.length !== 64) {
    return res.status(400).json('Räsi/parool vigane')
  }

  User.findOneAndUpdate(
    {'hash.hash': req.params.hash, 'hash.created': {$gt: currentDate}},
    {password: password, hash: {validated: Date.now()}},
    {new: true},
    (err, doc) => {
      err ? next(err) : res.json(respondWith('accept', 'OK', doc))
    }
  )
}

exports.forgotPassword = (req, res, next) => {
  const hash = generateHash(), email = req.body.email

  if (!email) return next(new Error('Missing required params'))

  User.findOneAndUpdate(
    {email: email},
    {hash: {hash: hash, created: Date.now()}},
    {new: true},
    (err, doc) => err || !doc
    ? next(err)
    : res.json(respondWith('status', `Aktiveerimislink saadeti meiliaadressile ${doc.email}`, doc))
  )
}