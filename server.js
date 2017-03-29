/**
 * Created by clstrfvck on 21/03/2017.
 */
const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');

const app = express(http);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//Example routing
//Test this with localhost/api/user/dog
const auth = require('./routes/auth');
app.use('/api/auth', auth);


///////////////////////////////////////////////////////////////////

app.get("/api", (req,res)=>{
    res.json("Yes hello this is API");
});


app.listen("3000", ()=>{
    console.log("Server now listening on port 3000")
});

