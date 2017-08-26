'use strict'

const mongoose = require('mongoose'),
Schema = mongoose.Schema,
contractSchema = mongoose.Schema({
  // esindaja objectId'd
  esindajad: [{required: true, type: Schema.Types.ObjectId, ref: 'user'}],
  metsameister: String,
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
  // tuleb objectId
  hinnatabel: String,
  kinnistu: {
    nimi: String,
    katastritunnus: String
  },
  // tuleb objectid
  lepingu_looja: String,
  createdAt: {type: Date, default: new Date()},
  // aktiivne, ootel, lõppenud, tehtud
  status: String
})

module.exports = mongoose.model('contract', contractSchema)

