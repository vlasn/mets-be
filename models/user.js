'use strict'

const mongoose = require('mongoose'),
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
        required: 'name is required',
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
        required: 'address is required',
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
      timestamps: true
    }
  )

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) {
    const duplicateError = new Error('Duplicate key')
    duplicateError.stack = err
    duplicateError.status = 409
    next(duplicateError)
  } else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message).join(' and ')
    const validationError = new Error(errors)
    validationError.stack = err
    validationError.status = 400
    next(validationError)
  } else {
    const databaseError = new Error('Database query failed')
    databaseError.stack = err
    next(databaseError)
  }
})

schema.pre('save', function (next) {
  // pre-save hook – what useful can be done here?
  next()
})

schema.pre('validate', function(next) {
  // pre-validation hook – what useful can be done here?
  next()
})

module.exports = mongoose.model('user', schema)