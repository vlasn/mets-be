const mongoose = require('mongoose')
      mongoose.Promise = global.Promise
      schema = mongoose.Schema({
          eesnimi: String,
          perenimi: String,
          telefon: Number,
          aadress: String,
          isikukood: Number,
          dokumendi_nr: String,
          juriidiline_isik: Boolean,
          reg_nr: Number,
          kmk_nr: Number
      })

const Person = mongoose.model('person', schema)

const create = person_data => {
  let d = Date.now().valueOf().toString()
      new_person = new Person({
        eesnimi: String,
        perenimi: String,
        telefon: Number,
        aadress: String,
        isikukood: Number,
        dokumendi_nr: String,
        juriidiline_isik: Boolean,
        reg_nr: Number,
        kmk_nr: Number
      })

  return new_person.save()
}

module.exports = {
  create,
  find
}

