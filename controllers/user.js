'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../utils/mailer'),
generateHash = require('../utils/hash'),
respondWith = require('../utils/response'),
signTokenWith = require('../utils/token').create

exports.create = (req, res, next) => {
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
  const email = req.body.email,
  password = req.body.password

  User.findOneAndUpdate(
    {'email': email, 'password': password},
    {lastLogin: Date.now()},
    (err, doc) => {
      if (err || !doc) {
        res.status(401).json(respondWith('reject', 'Vale parool või email'))
      } else {
        const data = {
          personal_data: doc.personal_data,
          createdAt: doc.createdAt,
          lastLoginAt: doc.lastLogin,
          job_title: doc.job_title,
          email: doc.email,
          _id: doc._id
        }

        data.token = signTokenWith({email: data.email, roles: doc.roles})

        res.json(respondWith('accept', 'OK', data))
      }
    }
  )
}

exports.find = (req, res, next) => {
  let keys = req.query.key.split(','),
  val = {$regex: req.query.value, $options: 'i'},
  conditions = [],
  q = {$or: conditions}

  for (const key of keys) {
    let q1 = {}, q2 = {}
    q1['personal_data.' + key] = val
    q2[key] = val
    conditions.push(q1) && conditions.push(q2)
  }

  User.find(q, (err, doc) => {
    err ? next(err = new Error('Ei leidnud')) : res.json(respondWith('accept', 'OK', doc))
  })
}

exports.verifyHash = (req, res, next) => {
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
    return res.status(400).json('Faulty request syntax')
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
  const hash = newHash()

  User.findOneAndUpdate(
    {email: email},
    {hash: {hash: hash, created: Date.now()}},
    {new: true},
    (err, doc) => err || !doc
    ? next(err)
    : res.json(respondWith('status', `Aktiveerimislink saadeti meiliaadressile ${doc.email}`, doc))
  )
}