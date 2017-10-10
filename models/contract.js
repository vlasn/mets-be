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
      ref: 'property'
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

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('contract', schema)

