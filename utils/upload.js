'use strict'

const multer = require('multer'),
path = require('path'),
fs = require('fs'),
loc = path.resolve(__dirname, `../uploaded_files/`),
storage = multer.diskStorage({
    destination: loc,
    filename: (req, file, cb) => {
        const name = file.originalname.split('.').shift(),
        ext = path.extname(file.originalname),
        fname = name + '_' + Date.now() + ext
        cb(null, fname)
    }
}),
upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.pdf') return cb(null, false)
        cb(null, true)
    }
}),
documentsUpload = upload.fields([
    { name: 'muu', maxCount: 5 },
    { name: 'leping', maxCount: 5 },
    { name: 'metsateatis', maxCount : 5}
])

exports.uploadDocuments = documentsUpload

exports.uploadDocument = () => {

    

}
