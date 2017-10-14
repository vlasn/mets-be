'use strict'
require('dotenv').config()

const app = require('./app'),
  db = require('./db'),
  port = process.env.PORT || 3000

;(async () => {
  try { 
    await db
    const server = app.listen(port, () => console.log(`✅  Server started on port ${port}`))
    process.on('SIGINT', () => { db.close() && server.close() && console.log('Server shut down gracefully') })
  } catch (error) { console.log('❌  Server failed to start because:', error) }
})()