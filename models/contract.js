'use strict'

const mongoose = require('mongoose'),
Schema = mongoose.Schema,
{MISSING_REQUIRED_PARAMS, MONGODB_QUERY_FAILED} = require('../constants'),
schema = mongoose.Schema({
  // esindaja objectId'd
  esindajad: [{required: true, type: Schema.Types.ObjectId, ref: 'user'}],
  metsameister: {type: String, required: true},
  projektijuht: String,
  dates: {
    raie_teostamine: Date,
    metsamaterjali_valjavedu: Date,
    raidmete_valjavedu: Date
  },
  documents: {
    metsateatis: [String],
    leping: [String],
    muu: [String]
  },
  hinnatabel: {type: Schema.Types.ObjectId},
  kinnistu: {
    nimi: String,
    katastritunnus: String
  },
  lepingu_looja: {type: Schema.Types.ObjectId},
  lastModifiedAt: {type: Date, default: new Date()},
  createdAt: {type: Date, default: new Date()},
  // aktiivne, ootel, lõppenud, tehtud
  status: {type: String, enum: ['active', 'pending']}
})

schema.post('save', (err, doc, next) => {
  err.name === 'ValidationError' ? next(MISSING_REQUIRED_PARAMS) : next(MONGODB_QUERY_FAILED)
})

module.exports = mongoose.model('contract', schema)

