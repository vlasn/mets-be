const mongoose = require('mongoose')

mongoose.Promise = global.Promise

const uploadSchema = mongoose.Schema({
    filename: {type: String, required: true},
    uploaded_by: {type: String, required: true}
})

const uploadModel = mongoose.model('upload', uploadSchema)

const insert = (filename, contract_id)=>{
  
  let q = new uploadModel({ 
    filename: filename,
    uploaded_by: email
  })

  return q.save()
}

module.exports = {uploadModel}

