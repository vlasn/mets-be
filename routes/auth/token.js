const jwt = require('jsonwebtoken')
			secret = process.env.SECRET
			exports.create = userData => {
				console.log(userData)
				return jwt.sign(userData, secret, {expiresIn: 3600})}
			exports.verify = (req, res, next) => {
				if (req.originalUrl === '/api/auth') return next()
				let token = req.headers['x-auth-token']
				//if (!token) return res.status(401).json('Missing token')
				jwt.verify(token, secret, (error, decoded) => {
					if (error || !decoded) return res.status(401).json(error.message)
					console.log(decoded.email)
					req.user = decoded.email
					req.privileges = decoded.roles.length
					next()
				})}
