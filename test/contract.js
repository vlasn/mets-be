'use strict'

const chai = require('chai')
const request = require('supertest').agent('http://localhost:3000')
const expect = chai.expect
var testUser

describe('user', function () {
  describe('create', function () {
    it('should create new user', function (done) {
      this.timeout(5000)
      request.post('/api/users')
        .send({ 'personalData': { name: 'Vello Veskimets', address: 'joogeva' }, email: 'veskimetsavelts@test.ee'})
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: {} })
          expect(response.body.data.role).to.equal('CLIENT')
          expect(response.body.data.personalData).to.deep.equal({ name: 'Vello Veskimets', address: 'joogeva' })
          expect(response.body.data.email).to.equal('veskimetsavelts@test.ee')
          testUser = response.body.data
          done()
        })
    })
  })
  
  describe('findByIdAndRemove', function () {
    it('should delete test user', function (done) {
      request.delete(`/api/users/${testUser._id}`)
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: {} })
          done()
        })
    })
  })
})
