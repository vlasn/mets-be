const app = require("express")()
			mongoose = require('mongoose')
			require("dotenv").config()
			MONGO_USER=process.env.MONGO_USER
			MONGO_PASS=process.env.MONGO_PASS
			MONGO_IP=process.env.MONGO_IP
			SECRET=process.env.SECRET
			PORT=process.env.PORT
			options = {user: MONGO_USER, pass: MONGO_PASS, auth: {authSource: 'admin'}}
			isProduction = process.env.NODE_ENV === 'production'

mongoose.connect(MONGO_IP, options)
mongoose.connection.on('error', err => console.log('Server halted because:\nMongoDB failed with: ', err.message))
mongoose.connection.on('open', () => {
	console.log('MongoDB: OK')
	app.listen(process.env.PORT || 3000) && console.log('Server: OK')
})

app.use(require('morgan')('dev'))
app.use('/api', require('./routes'))

app.use((req, res, next)=>{
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (!isProduction) {
  app.use((err, req, res, next)=>{
    console.log(err.stack)
    res.status(err.status || 500)
    res.json({'Midagi läks metsa :|': {
      message: err.message,
      error: err
    }})
  })
}

if (isProduction) {
	app.use((err, req, res, next)=>{
	  res.status(err.status || 500)
	  res.json({'errors': {
	    message: err.message,
	  }})
	})
}

