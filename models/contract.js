'use strict'

const mongoose = require('mongoose'),
schema = mongoose.Schema({
  // esindaja objectId'd
  esindajad: [String],
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

module.exports = mongoose.model('contract', schema)

