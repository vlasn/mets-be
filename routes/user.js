const express = require('express');
const router = express.Router();


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

router.get('/', (req,res)=>{
    res.json("Please define username")
});

module.exports = router;