'use strict'

const mongoose = require('mongoose'),
  schema = mongoose.Schema({
    Sihtkoht: {type: String, required: true},
    Puuliik: {type: String, required: true},
    Sortiment: {type: String, required: true},
    Diameeter_min: {type: Number, required: true},
    Diameeter_max: {type: Number, required: true},
    Pikkus_min: {type: Number, required: true},
    Pikkus_max: {type: Number, required: true},
    Kvaliteet: {type: String, required: true},
    Hind: {type: Number, required: true},
    Ylestootamine: Number,
    Vosatood: Number,
    Vedu: Number,
    Tasu: Number,
    Tulu: {type: Number}
  },
  {
    timestamps: true
  })

schema.post('save', function(err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) next(DUPLICATION_ERROR(err))
  else if (err.name === 'ValidationError') next(VALIDATION_ERROR(err))
  else next(DATABASE_ERROR(err))
})

module.exports = mongoose.model('product', schema)

