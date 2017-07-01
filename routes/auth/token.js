const jwt = require('jsonwebtoken')
			secret = process.env.SECRET
			create = userId => {return jwt.sign(userId, secret, {expiresIn: 60})}
			verify = (req, res, next) => {
				if (req.originalUrl === '/api/auth') return next()
				let token = req.headers['x-auth-token']
				jwt.verify(token, secret, (error, decoded) => error ? 
				res.status(401).json(error.name) : next())
			}
module.exports = {create, verify}
