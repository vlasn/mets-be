const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const userModel = require('./../models/userModel.js')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); 

router.post("/login",(req, res)=>{
    userModel.login(req.body.email, req.body.password, res)  
})

// hash verification - determining if the given hash is associated with an user document
router.get("/verify/:hash",(req, res)=>{
    userModel.verify(req.params.hash, res)
})

// user will be validated on successful hash exchange
router.post("/validate",(req, res)=>{
    userModel.validate(req.body.email, req.body.password, req.body.hash.hash, res)
})

router.post("/create",(req, res)=>{
    userModel.create(req.body.email, res)
})

router.post("/forgot",(req, res)=>{
    userModel.forgot(req.body.email, res)
})

module.exports = router;