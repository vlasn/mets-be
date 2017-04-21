const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const logSchema = mongoose.Schema({
    kestegi: String,
    midategi: String,
    millaltegi: Date
})

const logModel = mongoose.model('log', logSchema)

module.exports = {
	logModel
}

