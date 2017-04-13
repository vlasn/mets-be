const mongoose = require('mongoose');
const userSchema = mongoose.Schema({

    email: {type: String, required: true},
    password: String,
    hash: {
    	hash: {type: String, required: true},
		created: {type: String, default: Date.now},
    	validated: {type: Date}
    },
	lastLogin: {type: Date},
    roles: [
    	{ 
    		title: {type: String},
			created: {type: String, default: Date.now},
			disabled: {type: String}
    	}
    ]


});
const userModel = mongoose.model('user',userSchema);

module.exports = userModel;

