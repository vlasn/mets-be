const mongoose = require('mongoose')
//const userModel = require('./userModel.js').userModel
mongoose.Promise = global.Promise

const masterPricelistSchema = mongoose.Schema({
    destination: {type: String, required: true},
    tree_species: {type: String, required: true},
    assortment: {type: String, required: true},
    diameter_min: {type: Number, required: true},
    diameter_max: {type: Number, required: true},
    length_min: {type: Number, required: true},
    length_max: {type: Number, required: true},
    quality: {type: String, required: true},
    euro_per_festmeter: {type: Number, required: true},
    harvesting_price: Number,
    brush_works_price: Number,
    transport_price: Number,
    profit: Number,
    total_price: {type: Number, required: true}

}, {collection: 'master_pricelist'})

const masterPricelistModel = mongoose.model('', masterPricelistSchema)

const insert = (data) => {
    return masterPricelistModel.insertMany(data)
}

const checkForMatch = (incomingRow) => {
    masterPricelistModel.findOne({ 
        'destination': new RegExp(incomingRow.Ostja, "i")
    }).then(docs=>{
        console.log(docs)
        if(docs != null) return true
        return false
    }).catch(err=>{
        console.log(err)
        return false
    })
}

module.exports = {
	masterPricelistModel,
    insert
}

