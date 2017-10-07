'use strict'

const jwt = require('jsonwebtoken')
const secret = process.env.SECRET
const respondWith = require('./response')

exports.create = userData => jwt.sign(userData, secret, {expiresIn: 3600 * 365})

exports.verify = (req, res, next) => {
  if (req.originalUrl.includes('/api/auth')) return next()

  const token = req.headers['x-auth-token'] || null

  if (!token) return res.status(401).json(respondWith('reject', 'Missing token'))

  jwt.verify(token, secret, (error, decoded) => {
    if (error || !decoded) return res.status(401).json(respondWith('reject', 'Invalid token'))
    console.log(decoded)
    req.user = decoded.email
    next()
  })
}
