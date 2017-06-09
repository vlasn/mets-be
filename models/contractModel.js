const mongoose = require('mongoose'),
userModel = require('./userModel.js').userModel,
auth = require('./../routes/auth.js'),
responseFactory = auth.responseFactory

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

const create = (email, metsameister, documents, hinnatabel, contract_creator, res)=>{
  //console.log(userModel)
  userModel.findOne({ 'email': email })
      .then(foundClient => {
        if (!foundClient) {return Promise.reject('Sellise emailiga klienti ei eksisteeri!')}
        if (foundClient) {
          console.log("Found user with email (creating new contract): " + foundClient.email)
          console.log("Kohe peaksin looma lepingu!")
          let contract = new contractModel({
            esindajad: email,
            metsameister: metsameister,
            documents: documents,
            hinnatabel: hinnatabel,
            contract_creator: contract_creator,
            created_timestamp: Date.now()
          })

          return contract.save()
        }
      })
      .then((doc)=>{
          if(doc){
              res.json(responseFactory("accept","Leping loodud!"))
          }
        })
      .catch(err => {
        console.log("Veateade:",err)
        return res.json({
            status: "reject",
            msg: err
        })
      })
}

const fetchAllClientRelated = (client_email)=>{
  return (contractModel.find({ esindajad: client_email }))
}

module.exports = {
	contractModel,
    create,
    fetchAllClientRelated
}

