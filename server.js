const http = require("http")
const express = require("express")
const bodyParser = require('body-parser')
const app = express(http)
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mets')
const db = mongoose.connection
db.on('error', console.error.bind(console,'connection:error'))
db.once('open', ()=> console.log('MongoDB successfully connected'))

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

const auth = require('./routes/auth')
app.use('/api/auth', auth)

app.get("/api", (req,res)=>{
	// should return a comprehensive list of endpoints so they're all
	// in one place and easier to test and do front-end dev
    res.send("API")
})

app.listen("3000", ()=> console.log("Server now listening on port 3000"))

