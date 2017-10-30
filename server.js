'use strict'
require('dotenv').config()

const app = require('./app')
const databaseConnection = require('./db')
const port = process.env.PORT || 3000
const env = process.env.NODE_ENV
const ip = require('ip')

;(async () => {
  try {
    await databaseConnection
    const serverConnection = app.listen(port, () => console.log(`\n✅  Server started in ${env} environment on ${ip.address() + ':' + port}\n`))
    process.on('SIGINT', () => { databaseConnection.close() && serverConnection.close() && console.log('\nServer was shut down gracefully') })
  } catch (error) { console.log(`\n❌  Server encountered ${error}\n`) }
})()
