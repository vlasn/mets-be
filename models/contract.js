'use strict'

const mongoose = require('mongoose'),
schema = mongoose.Schema({
  esindajad: [String],
  metsameister: String,
  projektijuht: String,
  dates: {
    raielopetamine: Date,
    väljavedu: Date,
    raidmete_valjavedu: Date
  },
  documents: [String],
  hinnatabel: {
    timestamp: {type: Date, default: Date.now()},
    snapshot: {type: String}
  },
  kinnistu: {
    nimi: String,
    katastritunnused: [String]
  },
  contract_creator: {type: String, required: true},
  created_timestamp: {type: Date, default: Date.now()},
  status: String

})

module.exports = mongoose.model('contract', schema)





//very basic, needs
const updateContractLine = (id, key, value, remove=false) => {
  /*
    Vajab dates objekti uuendamiseks edasist query-buildingut
   */
  if(key==='katastritunnused'){
    update = {$set : {'kinnistu.katastritunnused': value}}
  } else if(key==='kinnistu') {
    update = {$set: {'kinnistu.nimi': value}}
  } else {
    update = {$set:{[key]:value}}
  }
  let opt = {new: true}
  console.log(update)
  return(contractModel.findOneAndUpdate({_id: id}, update, opt))
}

const fetch = (cadastre, metsameister, status, email)=>{
  return (contractModel.find({
    $or: [
      {'kinnistu.nimi': {$regex: cadastre}},
      {'kinnistu.katastritunnused': { $regex: cadastre }}
    ],
    metsameister: {$regex: metsameister},
    status: {$regex: status}
  }))
}

const insertById = (contract_id, file_name)=>{
  let conditions = {'_id': contract_id},
    update = {'documents.leping': file_name}
  return contractModel.findOneAndUpdate(conditions, update, {new: true})
}

