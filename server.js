const http = require("http")
express = require("express"),
bodyParser = require('body-parser'),
app = express(http),
mongoose = require('mongoose'),
xlsx = require('xlsx')

require("dotenv").config()

const MONGO_USER=process.env.MONGO_USER
const MONGO_PASS=process.env.MONGO_PASS

var options = {
   user: MONGO_USER,
   pass: MONGO_PASS,
   auth: {
       authdb: 'admin'
   }
}
mongoose.connect('mongodb://46.101.154.79:27017/mets', options)
const db = mongoose.connection
db.on('error', console.error.bind(console,'connection:error'))
db.once('open', ()=> console.log('MongoDB successfully connected'))

const auth = require('./routes/auth')
app.use('/api/auth', auth.router)

const xlsx_import = require('./routes/import')
app.use('/api/import', xlsx_import)

const upload = require('./routes/upload')
app.use('/api/upload', upload.app)

app.get("/api", (req,res)=>{
	// should return a comprehensive list of endpoints so they're all
	// in one place and easier to test and do front-end dev
    res.send("API")
})

app.listen("3000", ()=> console.log("Server now listening on port 3000"))

