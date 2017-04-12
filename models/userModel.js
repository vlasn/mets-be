const mongoose = require('mongoose');
const userSchema = mongoose.Schema({

    email: String,
    password: String,
    hash: String,
    //role: String


});
const userModel = mongoose.model('user',userSchema);

module.exports = userModel;

