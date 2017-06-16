const http = require("http")
express = require("express"),
app = express(http),
mongoose = require('mongoose')
require("dotenv").config()
const MONGO_USER=process.env.MONGO_USER,
MONGO_PASS=process.env.MONGO_PASS

const options = {
	user: MONGO_USER,
	pass: MONGO_PASS,
	auth: {
		authdb: 'admin'
	}
}

let peeter = mongoose.Types.ObjectId()
let peeter1 = mongoose.Types.ObjectId()
let peeter2 = mongoose.Types.ObjectId()
let peeter3 = mongoose.Types.ObjectId()
console.log(peeter,peeter1,peeter2,peeter3)

mongoose.connect('mongodb://46.101.154.79:27017/mets', options)
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

