'use strict'
require('dotenv').config()

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.set('debug', true)

module.exports = mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
