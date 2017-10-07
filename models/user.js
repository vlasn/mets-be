'use strict'

const mongoose = require('mongoose'),
{MISSING_REQUIRED_PARAMS, MONGODB_QUERY_FAILED} = require('../constants'),
schema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    select: false
  },
  hash: {
    type: {
      hash: {type: String, unique: true, sparse: true},
      createdAt: {type: Date, default: new Date()},
      validatedAt: {type: Date}
    }, select: false
  },
	lastLoginAt: Date,
  role: {
    type: String,
    select: false,
    enum: ['EMPLOYEE', 'ADMIN', 'CLIENT'],
    default: 'CLIENT'
  },
  personalData: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    address: { type: String, required: true },
    idNumber: {type: String, unique: true, sparse: true},
    documentNumber: {type: String, unique: true, sparse: true},
    juridical: Boolean,
    companyId: {
      type: String,
      unique: true,
      sparse: true
    },
    vatDutyNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    representative: {
      name: String,
      idNumber: String,
      mandate: String
    }
  }
},
{
  timestamps: true,
  versionKey: false
})

schema.post('save', (error, doc, next) => {
  error.name === 'MongoError' && error.code === 11000
  ? next(new Error('Duplicate key error'))
  : next(error)
})

module.exports = mongoose.model('user', schema)


