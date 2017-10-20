'use strict'

const chai = require('chai'),
  request = require('supertest').agent('http://localhost:3000'),
  expect = chai.expect

describe('user', function () {
  describe('findAll', function () {
    it('should return all users', function (done) {
      request.get('/api/users')
        .end(function (error, response) {
          console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: [] })
          expect(response.body.data).to.be.an('array')
          done()
        })
    })
  })

  describe('findOne', function () {
    it('should return nothing because the passed userId doesn\'t exist', function (done) {
      request.get('/api/users/59da733294ebbe19fd67f231')
        .end(function (error, response) {
          console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: null })
          expect(response.body.data).to.equal(null)
          done()
        })
    })
  })
})
