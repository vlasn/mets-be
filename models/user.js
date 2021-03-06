'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')

const schema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      minlength: [6, 'email must be atleast 6 characters long'],
      maxlength: [128, 'email can\'t exceed 128 characters'],
      validate: {
        validator: function (email) {
          return email.includes('@')
        },
        message: 'invalid email'
      }
    },
    password: {
      type: String,
      select: false,
      minlength: [6, 'password must be atleast 6 characters long'],
      maxlength: [128, 'password can\'t exceed 128 characters']
    },
    hash: {
      type: {
        hash: {
          type: String,
          unique: true,
          sparse: true,
          select: false
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
        minlength: [2, 'name must be atleast 2 characters long'],
        maxlength: [128, 'name can\'t exceed 128 characters']
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
          minlength: [11, 'invalid id number'],
          maxlength: [11, 'invalid id number']
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

schema.post('save', postSaveHook)
schema.post('findOneAndUpdate', postSaveHook)
schema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true
  next()
})

schema.pre('save', function (next) {
  // pre-save hook – what useful can be done here?
  next()
})

schema.pre('validate', function (next) {
  // pre-validation hook – what useful can be done here?
  next()
})

module.exports = mongoose.model('user', schema)
