'use strict'

const chai = require('chai')
const request = require('supertest').agent('http://localhost:3000')
const expect = chai.expect

describe('user', function () {
  describe('findAll', function () {
    it('should return all users', function (done) {
      request.get('/api/users')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: [] })
          expect(response.body.data).to.be.an('array')
          done()
        })
    })
  })

  describe('findOne', function () {
    it('should return 400 because passed id is not a valid ObjectId', function (done) {
      request.get('/api/users/59da733294ebbe19fd67f23')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(400)
          expect(response.body).to.be.an('object').that.includes({ success: false }, { error: '' })
          expect(response.body.data).to.equal(undefined)
          done()
        })
    })
  })
})
