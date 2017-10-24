'use strict'

const mongoose = require('mongoose')
const postSaveHook = require('../utils/modelPostSaveHook')

const ObjectId = mongoose.Schema.Types.ObjectId
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
    offer: {
      type: ObjectId
    },
    property: {
      required: true,
      type: ObjectId,
      ref: 'property'
    },
    contractCreator: {
      type: ObjectId,
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

schema.post('save', postSaveHook)

module.exports = mongoose.model('contract', schema)
