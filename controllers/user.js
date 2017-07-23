'use strict'

const User = require('../models/user'),
crypto = require('crypto'),
sendMagicLinkTo = require('../util/mailer'),
generateHash = require('../util/hash')


exports.create = (req, res, next) => {
	const newHash = generateHash()
	console.log('new hash:', newHash)

	req.body.hash = {
		hash: newHash
	}

  	User.create(req.body, (err, doc) => {
	  	if (err) return next(err)

			sendMagicLinkTo(doc.email, doc.hash.hash, (err, ok) => {
	  			if (err) return res.status(500).json('Aktiveerimislinki ei saadetud – kontakteeru bossiga')
	  			res.status(201).json(`Aktiveerimislink saadeti meiliaadressile ${doc.email}`)
	  	})
	  })
}

exports.login = (req, res, next) => {
	const email = req.body.email,
	password = req.body.password

	User.findOneAndUpdate(
		{'email': email, 'password': password},
		{lastLogin: Date.now()},
		(err, doc) => err || !doc
		? next(err = 'Vale parool või email')
		: res.send(doc)
	)
}

exports.findByEmail = (req, res, next) => {
	const email = req.params.email

	User.findOne({'email': {$regex: '^' + email, $options: 'i'}}, (err, doc) => {
		err || !doc ? next(err = 'Ei leidnud') : res.json(doc)
	})
}

exports.verifyHash = (req, res, next) => {
	const currentDate = new Date()
	currentDate.setDate(currentDate.getDate() - 1)

	User.findOne({
			'hash.hash': req.params.hash,
			'hash.created': {$gt: currentDate}
		},
		(err, doc) => {
			err || !doc ? next(err = 'Räsi ei sobi või aegunud') : res.json(doc)
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
			err ? next(err) : res.json
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
		: res.json(`Aktiveerimislink saadeti meiliaadressile ${doc.email}`)
	)
}