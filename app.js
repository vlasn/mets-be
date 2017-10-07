'use strict'

const app = require('express')(),
  isProduction = process.env.NODE_ENV === 'production',
  path = require('path'),
  bodyParser = require('body-parser')

app.set('json spaces', 2)

app.use(bodyParser.json())
app.use(require('morgan')('dev'))

app.use('/api', require('./routes'))

app.use((req, res, next) => {
  res.status(404).json({ status: 'reject', error: 'Invalid route' })
})

app.use((err, req, res, next) => {
  const error = err.message, 
    stack = isProduction ? undefined : err.stack

  res.status(err.status || 500).json({ success: false, error, stack })
})

app.get('/api', (req, res) => {
	res.sendFile(path.join(__dirname + '/api.html'))
})

module.exports = app