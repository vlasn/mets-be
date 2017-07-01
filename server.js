const app = require("express")(),
			mongoose = require('mongoose'),
			pdf = require('./routes/generatepdf.js')
			require("dotenv").config()
			MONGO_USER=process.env.MONGO_USER,
			MONGO_PASS=process.env.MONGO_PASS,
			MONGO_IP=process.env.MONGO_IP,
			SECRET=process.env.SECRET,
			PORT=process.env.PORT,
			options = {user: MONGO_USER, pass: MONGO_PASS, auth: {authdb: 'admin'}},
			jwt = require('jsonwebtoken'),
			isProduction = process.env.NODE_ENV === 'production'

app.use('/api/pdf', (req,res) => pdf(res))

app.use(require('morgan')('dev'))

mongoose.connect(MONGO_IP, options)
mongoose.connection.on('error', console.error.bind(console,'connection:error'))
mongoose.connection.once('open', ()=> console.log('MongoDB successfully connected'))



// connecting app to routes
app.use('/api', require('./routes'))

// global error management
/*app.use((req, res, next)=>{
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// will print stacktrace
if (!isProduction) {
  app.use((err, req, res, next)=>{
    console.log(err.stack)
    res.status(err.status || 500)
    res.json({'errors': {
      message: err.message,
      error: err
    }})
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next)=>{
  res.status(err.status || 500)
  res.json({'errors': {
    message: err.message,
    error: {}
  }})
})*/


/*
app.get("/api", (req,res)=>{
	// should return a comprehensive list of endpoints so they're all
	// in one place and easier to test and do front-end dev
  res.send("API")
})*/



app.listen(process.env.PORT || 3000, ()=> console.log("Server now listening on port 3000"))

