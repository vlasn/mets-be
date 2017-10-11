'use strict'

const mongoose = require('mongoose'),
  { VALIDATION_ERROR,
    DUPLICATION_ERROR,
    DATABASE_ERROR } = require('../errors'),
  schema = mongoose.Schema({
    Sihtkoht: { type: String, required: true },
    Puuliik: { type: String, required: true },
    Sortiment: { type: String, required: true },
    Diameeter_min: { type: Number, required: true },
    Diameeter_max: { type: Number, required: true },
    Pikkus_min: { type: Number, required: true },
    Pikkus_max: { type: Number, required: true },
    Kvaliteet: { type: String, required: true },
    Hind: { type: Number, required: true },
    Ylestootamine: { type: Number, required: true },
    Vosatood: { type: Number, required: true },
    Vedu: { type: Number, required: true },
    Tasu: { type: Number, required: true },
    Tulu: { type: Number, required: true }
  },
  {
    timestamps: true
  })

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('offer', schema)
