'use strict'

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  schema = mongoose.Schema({
    // esindajad
    representatives: [{
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'user'
    }],
    // metsameister
    foreman: {
      type: String,
      required: true
    },
    projectManager: {
      type: String,
      required: true
    },
    dates: {
      logging: Date,
      timberTransport: Date,
      wasteTransport: Date
    },
    documents: {
      forestNotices: [String],
      contracts: [String],
      other: [String]
    },
    hinnatabel: {
      type: Schema.Types.ObjectId
    },
    property: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'user'
    },
    contractCreator: {
      type: Schema.Types.ObjectId,
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

schema.post('save', (err, doc, next) => {
  err.name === 'ValidationError' 
    ? next(MISSING_REQUIRED_PARAMS) 
    : next(MONGODB_QUERY_FAILED)
})

module.exports = mongoose.model('contract', schema)

