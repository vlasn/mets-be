'use strict'

const mongoose = require('mongoose'),
nodemailer = require('nodemailer'),
schema = mongoose.Schema({
  email: {type: String, unique: true, sparse: true},
  password: {type: String, select: false},
  hash: {
    type: {
      hash: {type: String, unique: true, sparse: true},
      createdAt: {type: Date, default: new Date()},
      validatedAt: {type: Date}
    }, select: false
  },
	lastLoginAt: Date,
  role: {type: String, select: false, enum: ['EMPLOYEE', 'ADMIN', 'CLIENT'], default: 'CLIENT'},
  job_title: {type: String},
  personal_data: {
    nimi: {type: String, required: true},
    tel_nr: String,
    aadress: {type: String, required: true},
    isikukood: {type: String, unique: true, sparse: true},
    dok_nr: {type: String, unique: true, sparse: true},
    juriidiline_isik: Boolean,
    reg_nr: {type: String, unique: true, sparse: true},
    kmk_nr: {type: String, unique: true, sparse: true},
    esindaja: {
      nimi: String,
      isikukood: String,
      volituse_alus: String
    }
  }
})

schema.post('save', (error, doc, next) => {
  error.name === 'MongoError' && error.code === 11000
  ? next(new Error('Duplicate key error'))
  : next(error)
})

module.exports = mongoose.model('user', schema)


