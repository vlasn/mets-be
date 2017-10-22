'use strict'

const app = require('express')()
const isProduction = process.env.NODE_ENV === 'production'
// const path = require('path')
const bodyParserJson = require('body-parser').json()
const helmet = require('helmet')()
const morgan = require('morgan')('dev')

app.set('json spaces', 2)

const errorHandler = (err, req, res, next) => res.status(err.status || 500).json({
  success: false,
  error: err.message,
  stack: isProduction ? undefined : err.stack
})

const notFoundHandler = (req, res, next) => res.status(404).json({ success: false, error: 'invalid route' })

// pre-route middleware
app.use(helmet, bodyParserJson, morgan)

// mid- and post-route middleware
app.use('/api', require('./routes'), notFoundHandler, errorHandler)

// WIP
// app.get('/api', (req, res) => res.sendFile(path.join(__dirname + '/api.html')))

module.exports = app
