const jwt = require('jsonwebtoken')
			secret = process.env.SECRET
			exports.create = userId => {return jwt.sign(userId, secret, {expiresIn: 3600})}
			exports.verify = (req, res, next) => {
				if (req.originalUrl === '/api/auth') return next()
				let token = req.headers['x-auth-token']
				jwt.verify(token, secret, (error, decoded) => error ? 
				res.status(401).json(error.message) : next())
			}
