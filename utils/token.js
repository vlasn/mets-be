'use strict'

const jwt = require('jsonwebtoken')
const secret = process.env.SECRET
const respondWith = require('./response')
const asyncMiddleware = require('./asyncMiddleware')

exports.create = userData => jwt.sign(userData, secret, { expiresIn: 1 })

exports.verify = asyncMiddleware(async (req, res, next) => {
  if (req.originalUrl.includes('/api/auth')) return next()

  const token = req.headers['x-auth-token'] || null

  if (!token) {
    const error = new Error('missing token')
    error.status = 401
    throw error
  }

  const options = {
    ignoreExpiration: true,
    clockTimeStamp: Date.now()
  }

  jwt.verify(token, secret, options, (error, decoded) => {
    if (error || !decoded) {
      console.log('Token is invalid!')
      const error = new Error('invalid token')
      error.status = 401
      console.log(decoded)
      return next(error)
    }

    console.log('Token is valid!')
    console.log(`Token is ${decoded.exp < Date.now() ? 'expired' : 'not yet expired'}`)

    req.user = decoded.email
    next()
  })
})

function isExpired() {
  
}
