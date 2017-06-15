const mongoose = require('mongoose'),
userModel = require('./userModel.js').userModel,
helper = require('./../routes/helper.js'),
responseFactory = helper.responseFactory

mongoose.Promise = global.Promise

const contractSchema = mongoose.Schema({
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
        snapshot: {type: String, required: true}
    },
    katastritunnused: [{
        tunnus: String,
        nimi: String
    }],
    contract_creator: {type: String, required: true},
    created_timestamp: {type: Date, default: Date.now()},
    status: String

})

const contractModel = mongoose.model('contract', contractSchema)

const create = (new_contract)=>{
  let contract = new contractModel({
    esindajad: new_contract.email,
    metsameister: new_contract.metsameister,
    documents: new_contract.documents,
    hinnatabel: new_contract.hinnatabel,
    contract_creator: new_contract.contract_creator,
    katastritunnused: new_contract.katastritunnused,
    status: new_contract.status,
    created_timestamp: Date.now()
  })
  return contract.save()
}

const fetchAllClientRelated = (client_email)=>{
  return (contractModel.find({ esindajad: client_email }))
}

const fetch = (cadastre, metsameister, status)=>{
  return (contractModel.find({ 
  	$or: [
      {'katastritunnused.tunnus': {$regex: cadastre}}, 
      {'katastritunnused.nimi': { $regex: cadastre }},
      {'esindajad': { $regex: cadastre }}
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
  create,
  fetchAllClientRelated,
  insertById,
  fetch
}

