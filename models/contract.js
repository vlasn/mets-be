const mongoose = require('mongoose')
  userModel = require('./user.js').user,
  helper = require('./../routes/helper.js'),
  responseFactory = helper.responseFactory

mongoose.Promise = global.Promise

const schema = mongoose.Schema({
  // eelloodud kasutaja(d)
  esindajad: [String],
  // varemloodud kasutaja - metsahalduri töötaja
  metsameister: String,
  // metsahalduri töötaja
  projektijuht: String,
  dates: {
    raielopetamine: Date,
    väljavedu: Date,
    raidmete_valjavedu: Date
  },
  documents: {
    // needs a more descriptive name to it
    // values of these will be a FILEPATH
    leping: String,
    metsateatis: String
  },
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

const contractModel = mongoose.model('contract', schema)

const create = (new_contract)=>{
  let contract = new contractModel({
    esindajad: new_contract.email,
    projektijuht: new_contract.projektijuht,
    metsameister: new_contract.metsameister,
    documents: new_contract.documents,
    dates: new_contract.dates,
    hinnatabel: new_contract.hinnatabel,
    contract_creator: new_contract.contract_creator,
    kinnistu: new_contract.kinnistu,
    status: new_contract.status,
    created_timestamp: Date.now()
  })
  return contract.save()
}

const fetchAllClientRelated = (client_email)=>{
  return contractModel.find({ 'esindajad': { $in: [client_email]}})
}

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

module.exports = {
  contractModel,
  updateContractLine,
  create,
  fetchAllClientRelated,
  insertById,
  fetch
}

