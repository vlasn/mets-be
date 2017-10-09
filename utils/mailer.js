'use strict'

const nodemailer = require('nodemailer'),
  EMAIL_LOGIN = process.env.EMAIL_LOGIN,
  EMAIL_PASS = process.env.EMAIL_PASS,
  HOSTNAME = process.env.HOSTNAME,
  success = require('./respond'),
  generateHash = require('./hash'),
  User = require('../models/user')

module.exports = function(user, res, next) {
  const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_LOGIN,
      pass: EMAIL_PASS
    }
  }),
  { email } = user,
  hash = generateHash(),
  mailFieldOptions = {
    from: '"Metsahaldur | Kasutaja valideerimine" <metsahaldur.test@gmail.com>',
    to: `${email}`,
    subject: 'Valideeri oma kasutajakonto',
    text: 'Sämpel tekst',
    html: `Palun kliki järgmisele lingile: <a href="${HOSTNAME}/validate/${hash}">Aktiveeri konto</a>`
  }

  mailTransporter.sendMail(mailFieldOptions, (error, info) => {
    if (error || !info || !info.response.includes(' OK ') || info.envelope.to[0] !== email || 
        info.accepted[0] !== email) {
      const magicLinkError = new Error(`failed to send activation link to ${email}`)

      return next(magicLinkError)
    }

    // below information should go to logs at some point
    // console.log('Magic link with messageId %s sent to: %s', info.messageId, info.response)
    User.findByIdAndUpdate(
      user._id,
      {
        hash : {
          hash,
          createdAt: new Date()
        }
      },
      {
        new: true,
        lean: true
      },
      function(err) {
        if (err) return next(err)
        success(res, user)
      }
    )
  })
}