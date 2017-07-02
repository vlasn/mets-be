const jwt = require('jsonwebtoken')
			secret = process.env.SECRET
			exports.create = userData => {
				console.log(userData)
				return jwt.sign(userData, secret, {expiresIn: 3600})}
			exports.verify = (req, res, next) => {
				if (req.originalUrl === '/api/auth') return next()
				let token = req.headers['x-auth-token']
				jwt.verify(token, secret, (error, decoded) => error ? 
				res.status(401).json(error.message) : next())}
			exports.isEmployee = req => {
				let token = req.headers['x-auth-token']
				jwt.verify(token, secret, (error, decoded) => {
				console.log(error)
				if (error || !decoded || decoded.roles.length < 2) return true
				return true})}
