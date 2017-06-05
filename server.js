const http = require("http")
express = require("express"),
bodyParser = require('body-parser'),
app = express(http),
mongoose = require('mongoose'),
xlsx = require('xlsx')

mongoose.connect('mongodb://localhost:27017/mets')
const db = mongoose.connection
db.on('error', console.error.bind(console,'connection:error'))
db.once('open', ()=> console.log('MongoDB successfully connected'))

const auth = require('./routes/auth')
app.use('/api/auth', auth)

const routeupload = require('./routes/upload')
app.use('/api/upload', routeupload)

app.get("/api", (req,res)=>{
	// should return a comprehensive list of endpoints so they're all
	// in one place and easier to test and do front-end dev
    res.send("API")
})

// excel file parsing and printing out first row (in object form)
var workbook = xlsx.readFile('oigeakt.xlsx')
var sheet_name_list = workbook.SheetNames
sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y]
    var headers = {}
    var data = []
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var col = z.substring(0,1)
        var row = parseInt(z.substring(1))
        var value = worksheet[z].v

        //store header names
        if(row == 1) {
            headers[col] = value
            continue;
        }

        if(!data[row]) data[row]={}
        data[row][headers[col]] = value
    }
    //drop those first two rows which are empty
    data.shift()
    data.shift()
    console.log(data[0])
})

// file upload testing


app.listen("3000", ()=> console.log("Server now listening on port 3000"))

