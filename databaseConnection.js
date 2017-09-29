'use strict'
require('dotenv').config()

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.set('debug', true)
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
mongoose.connection.on('error', error => console.log('❌  Could not establish connection with database:', error))
process.on('SIGINT', () => mongoose.connection.close(() => process.exit(0)) && console.log('❌  Disconnected from database'))

module.exports = mongoose.connection
