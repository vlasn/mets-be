const http = require("http"),
			express = require("express"),
			app = express(http),
			mongoose = require('mongoose')
			morgan = require("morgan"),
			pdf = require('./routes/generatepdf.js')
			require("dotenv").config(),
			MONGO_USER=process.env.MONGO_USER,
			MONGO_PASS=process.env.MONGO_PASS,
			MONGO_IP=process.env.MONGO_IP,
			SECRET=process.env.SECRET,
			options = {user: MONGO_USER, pass: MONGO_PASS, auth: {authdb: 'admin'}},
			jwt = require('jsonwebtoken')

app.use('/api/pdf', (req,res) => pdf(res))

app.use(morgan('dev'))

mongoose.connect(MONGO_IP, options)
mongoose.connection.on('error', console.error.bind(console,'connection:error'))
mongoose.connection.once('open', ()=> console.log('MongoDB successfully connected'))

app.use('/', (req, res, next)=>{
	if(req.originalUrl === '/api/user/login') return next()
  let token = req.headers['x-access-token']
  if(!token) res.status(403).json({status:'reject', msg:'Missing token'})
  jwt.verify(token, secret, (err, decoded)=>{      
    if (err) {
      return res.status(401).json({status:'reject', msg:'Invalid token'})
    } else {
      console.log(decoded)
      req.decoded = decoded
      next()
    }
  })
})

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

