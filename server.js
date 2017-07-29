'use strict'
require('dotenv').config()

const app = require("express")(),
mongoose = require('mongoose'),
MONGO_USER=process.env.MONGO_USER,
MONGO_PASS=process.env.MONGO_PASS,
MONGO_IP=process.env.MONGO_IP,
SECRET=process.env.SECRET,
PORT=process.env.PORT,
options = {user: MONGO_USER, pass: MONGO_PASS, auth: {authSource: 'admin'}},
productionEnvironment = process.env.NODE_ENV === 'production',
path = require("path"),
bodyParser = require('body-parser')

mongoose.connect(MONGO_IP, options)
mongoose.connection.on('error', err => console.log('Server halted because:\nMongoDB failed with: ', err.message))
mongoose.connection.once('open', () => {
	console.log('MongoDB: OK')
	app.listen(process.env.PORT || 3000) && console.log('Server: OK')
})

mongoose.Promise = global.Promise
app.use(bodyParser.json())
app.use(require('morgan')('dev'))
app.set('json spaces', 4)

app.get('/api', (req, res) => {
	res.sendFile(path.join(__dirname + '/api.html'))
})

app.use('/api', require('./routes'))

app.use((req, res, next) => {
  res.status(404).send('Specified URL was not found')
})

if (!productionEnvironment) {
  app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(err.status || 500)
    res.json({
      status: 'reject',
      message: err.message,
      error: err.stack
    })
  })
}

app.use((err, req, res, next)=>{
  res.status(err.status || 500)
  res.json({
  	status: 'reject',
    message: err.message
  })
})


