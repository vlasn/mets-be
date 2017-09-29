'use strict'
require('dotenv').config()

const app = require("express")(),
  databaseConnection = require('./databaseConnection'),
  isProduction = process.env.NODE_ENV === 'production',
  path = require("path"),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000;

databaseConnection.once('connected', () => {
  app.listen(port, () => {
    console.log(`✅  Metsahaldur API listening on ${port} 🌲`)
  })
})

app.use(bodyParser.json())
app.use(require('morgan')('dev'))
app.set('json spaces', 2)

app.get('/api', (req, res) => {
	res.sendFile(path.join(__dirname + '/api.html'))
})

app.use('/api', require('./routes'))

app.use((req, res, next) => {
  res.status(404).json({status: 'reject', message: 'Invalid route'})
})

app.use((err, req, res, next) => {
  const error = isProduction ? null : err.stack

  res.status(err.status || 500).json({
    status: 'reject',
    message: err.message,
    error
  })
})

