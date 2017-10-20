'use strict'

const mongoose = require('mongoose')
const { VALIDATION_ERROR,
    DUPLICATION_ERROR,
    DATABASE_ERROR } = require('../errors')
const schema = mongoose.Schema(
  {
    representatives: [{
      required: 'atleast one representative is required',
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }],
    foreman: {
      type: String,
      required: 'foreman is a required field'
    },
    projectManager: {
      type: String,
      required: 'project manager is a required field'
    },
    dates: {
      logging: Date,
      timberTransport: Date,
      wasteTransport: Date
    },
    documents: {
      forestNotices: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: new Date() },
        _id: false
      }],
      contracts: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: new Date() },
        _id: false
      }],
      other: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: new Date() },
        _id: false
      }]
    },
    hinnatabel: {
      type: mongoose.Schema.Types.ObjectId
    },
    property: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'property'
    },
    contractCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'executed', 'expired'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

schema.post('save', function (err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('contract', schema)
