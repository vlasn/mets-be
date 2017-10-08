'use strict'

const nodemailer = require('nodemailer'),
  EMAIL_LOGIN = process.env.EMAIL_LOGIN,
  EMAIL_PASS = process.env.EMAIL_PASS,
  HOSTNAME = process.env.HOSTNAME,
  respondWith = require('./response')

module.exports = function(next, email, hash) {
  const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_LOGIN,
      pass: EMAIL_PASS
    }
  }),
  mailFieldOptions = {
    from: '"Metsahaldur | Kasutaja valideerimine" <metsahaldur.test@gmail.com>',
    to: `${email}`,
    subject: 'Valideeri oma kasutajakonto',
    text: 'Sämpel tekst',
    html: `Palun kliki järgmisele lingile: <a href="${HOSTNAME}/validate/${hash}">Aktiveeri konto</a>`
  }

  mailTransporter.sendMail(mailFieldOptions, (error, info) => {
    if (error || !info || !info.response.includes(' OK ') || info.envelope.to[0] !== email) {
      const magicLinkError = new Error(`Failed to send activation link to ${email}`)
      return next(magicLinkError)
    }

    console.log('Magic link with messageId %s sent to: %s', info.messageId, info.response)
  })
}