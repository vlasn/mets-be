'use strict'

const mongoose = require('mongoose'),
nodemailer = require('nodemailer'),
schema = mongoose.Schema({
  email: {type: String, unique: true},
  password: String,
  hash: {
  	hash: {type: String, unique: true},
    createdAt: {type: Date, default: new Date()},
  	validatedAt: {type: Date}
  },
	lastLoginAt: Date,
  roles: [{
    role: {type: String},
  	createdAt: {type: Date, default: new Date()},
  	disabled: {type: Boolean, default: false}
  }],
  job_title: String,
  personal_data: {
    nimi: {type: String, required: true},
    tel_nr: String,
    aadress: {type: String, required: true},
    isikukood: {type: String, unique: true},
    dok_nr: {type: String, unique: true},
    juriidiline_isik: Boolean,
    reg_nr: {type: String, unique: true},
    kmk_nr: {type: String, unique: true},
    esindaja: {
      nimi: String,
      isikukood: String,
      volituse_alus: String
    }
  },
  createdAt: {type: Date, default: new Date()}
})

schema.post('save', (error, doc, next) => {
  error.name === 'MongoError' && error.code === 11000
  ? next(new Error('Duplicate key error'))
  : next(error)
})

module.exports = mongoose.model('user', schema)


