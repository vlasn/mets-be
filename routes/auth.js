const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); 


router.get('/dog', (req, res)=>{
    res.json({
        username: "dog",
        age: "3",
        greetings: {
            happy: "woof",
            angry: "bark",
            sad: "howl"
        }
    });
});



router.post("/",(req, res)=>{
    let username = req.body.username;
    let password = req.body.password;
    res.send("Edukas login");
});

router.get('/', (req,res)=>{
    res.json("Please define username")
});

module.exports = router;