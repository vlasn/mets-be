'use strict'

const mongoose = require('mongoose'),
nodemailer = require('nodemailer'),
schema = mongoose.Schema({
  email: {type: String, unique: true, required: true},
  password: String,
  hash: {
  	hash: {type: String, required: true},
    createdAt: {type: Date, default: new Date()},
  	validatedAt: {type: Date}
  },
	lastLoginAt: {type: Date},
  roles: [{
    role: {type: String},
  	createdAt: {type: Date, default: new Date()},
  	disabled: Boolean
  }],
  job_title: String,
  personal_data: {
    nimi: String,
    tel_nr: Number,
    aadress: String,
    isikukood: Number,
    dok_nr: String,
    eraisik: Boolean,
    juriidiline_isik: Boolean,
    reg_nr: Number,
    kmk_nr: Number
  }
})

schema.post('save', (error, doc, next) => {
  error.name === 'MongoError' && error.code === 11000
  ? next(new Error('There was a duplicate key error'))
  : next(error)
})

module.exports = mongoose.model('user', schema)


