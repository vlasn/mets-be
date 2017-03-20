/**
 * Created by clstrfvck on 21/03/2017.
 */
const http = require("http");
const express = require("express");
const app = express(http);

//Example routing
//Test this with localhost/api/user/dog
const user = require('./routes/user');
app.use('/api/user', user);


//"blank response":
app.get("/api", (req,res)=>{
    res.json("Yes hello this is API");
});

app.listen("3000", ()=>{
    console.log("Server now listening on port 3000")
});

