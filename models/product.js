'use strict'

const mongoose = require('mongoose'),
{MISSING_REQUIRED_PARAMS, MONGODB_QUERY_FAILED} = require('../constants'),
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
    Tulu: {type: Number},
    Kuupaev: {type: Date, default: new Date()}
})

schema.post('save', (err, doc, next) => {
  err.name === 'ValidationError' ? next(MISSING_REQUIRED_PARAMS) : next(MONGODB_QUERY_FAILED)
})

module.exports = mongoose.model('product', productSchema)

