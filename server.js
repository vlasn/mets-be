const http = require("http"),
express = require("express"),
app = express(http),
mongoose = require('mongoose')
require("dotenv").config(),
MONGO_USER=process.env.MONGO_USER,
MONGO_PASS=process.env.MONGO_PASS,
MONGO_IP=process.env.MONGO_IP,
options = {
	user: MONGO_USER,
	pass: MONGO_PASS,
	auth: {
		authdb: 'admin'
	}
}

mongoose.connect(MONGO_IP, options)
mongoose.connection.on('error', console.error.bind(console,'connection:error'))
mongoose.connection.once('open', ()=> console.log('MongoDB successfully connected'))

const user = require('./routes/user')
app.use('/api/user', user.router)

const contract = require('./routes/contract')
app.use('/api/contract', contract.router)

const pricelist = require('./routes/pricelist')
app.use('/api/pricelist', pricelist.router)

// for importing files to the system
// data extraction + storage
const _import = require('./routes/import')
app.use('/api/import', _import.router)

// purely for storing files on the server
const upload = require('./routes/upload')
app.use('/api/upload', upload.router)

app.get("/api", (req,res)=>{
	// should return a comprehensive list of endpoints so they're all
	// in one place and easier to test and do front-end dev
  res.send("API")
})

app.listen("3000", ()=> console.log("Server now listening on port 3000"))

