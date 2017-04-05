const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const app = express(http);
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mets');
const db = mongoose.connection;//active database
db.on('error', console.error.bind(console,'connection:error'));
db.once('open', ()=>{
    console.log('MongoDB successfully connected');
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const auth = require('./routes/auth');
app.use('/api/auth/login', auth);

const createUser = require('./routes/createUser');
app.use('/api/auth/create', createUser);

app.get("/api", (req,res)=>{
    res.send("API");
});

app.listen("3000", ()=>{
    console.log("Server now listening on port 3000")
});

