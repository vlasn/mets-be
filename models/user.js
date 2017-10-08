'use strict'

const mongoose = require('mongoose'),
  generateHash = require('../utils/hash'),
  sendMagicLinkTo = require('../utils/mailer'),
  schema = mongoose.Schema({
    email: {
      type: String,
      unique: true,
      sparse: true,
      minlength: 6,
      maxlength: 128
    },
    password: {
      type: String,
      select: false,
      minlength: 6,
      maxlength: 128
    },
    hash: {
      type: {
        hash: {
          type: String,
          unique: true,
          sparse: true
        },
        createdAt: {
          type: Date,
          default: new Date()
        },
        validatedAt: Date
      },
      select: false
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
        required: true,
        minlength: 2,
        maxlength: 128
      },
      phone: {
        type: String,
        minlength: 5,
        maxlength: 20
      },
      address: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 128
      },
      idNumber: {
        type: String,
        unique: true,
        sparse: true,
        minlength: 11,
        maxlength: 11
      },
      documentNumber: {
        type: String,
        unique: true,
        sparse: true,
        minlength: 6,
        maxlength: 32
      },
      juridical: Boolean,
      companyId: {
        type: String,
        unique: true,
        sparse: true,
        minlength: 6,
        maxlength: 32
      },
      companyName: {
        type: String,
        minlength: 6,
        maxlength: 32
      },
      vatDutyNumber: {
        type: String,
        unique: true,
        sparse: true,
        minlength: 6,
        maxlength: 32
      },
      representative: {
        name: {
          type: String,
          minlength: 6,
          maxlength: 32
        },
        idNumber: {
          type: String,
          minlength: 11,
          maxlength: 11
        },
        mandate: {
          type: String,
          minlength: 6,
          maxlength: 32
        }
      }
    }
  },
    {
      timestamps: true,
      versionKey: false
    }
  )

schema.post('save', (err, doc, next) => {
  const error = new Error(err._message || err.message)
  error.status = 400
  
  err.name === 'MongoError' &&
  err.code === 11000
  ? next(new Error('Duplicate key error'))
  : next(error)
})

schema.pre('save', function (next) {
  if (this.email) {
    if (!this.email.includes('@')) next()
    this.hash = {
      hash: generateHash(),
      createdAt: new Date()
    }

    sendMagicLinkTo(next, this.email, this.hash.hash)
  }
  next()
})

schema.pre('validate', function(next) {
  // pre-validation hook – what useful can be done here?
  next()
})

module.exports = mongoose.model('user', schema)