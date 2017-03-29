const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const app = express(http);
const auth = require('./routes/auth');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', auth);

app.get("/api", (req,res)=>{
    res.send("API");
});

app.listen("3000", ()=>{
    console.log("Server now listening on port 3000")
});

