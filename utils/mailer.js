'use strict'

const nodemailer = require('nodemailer'),
EMAIL_LOGIN = process.env.EMAIL_LOGIN,
EMAIL_PASS = process.env.EMAIL_PASS,
HOSTNAME = process.env.HOSTNAME,
respondWith = require('./response')

module.exports = (email, hash, res) => {
    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {user: EMAIL_LOGIN, pass: EMAIL_PASS}
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
      	console.log(error)

        return res.status(500).json(respondWith('reject', error))
      }

      console.log('Message %s sent: %s', info.messageId, info.response)

      res.status(200).json(respondWith('accept', `Aktiveerimislink saadeti meiliaadressile ${info.envelope.to[0]}`))
    })
}