'use strict'

const jwt = require('jsonwebtoken'),
secret = process.env.SECRET

exports.create = userData => jwt.sign(userData, secret, {expiresIn: 3600})

exports.verify = (req, res, next) => {
	if (req.originalUrl.includes('/api/auth')) return next()
	if (!token) return res.status(401).json('Missing token')
	jwt.verify(req.headers['x-auth-token'], secret, (error, decoded) => {
		if (error || !decoded) return res.status(401).json(error.message)
		console.log(decoded.email)
		req.user = decoded.email
		req.privileges = decoded.roles.length
		next()
	})
}
