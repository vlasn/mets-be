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
        .send({ 'personalData': { name: 'Manny', address: 'joogeva' }, email: '66metsahaldur@test.ee'})
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: {} })
          expect(response.body.data.role).to.equal('CLIENT')
          expect(response.body.data.personalData).to.deep.equal({ name: 'Manny', address: 'joogeva' })
          testUser = response.body.data
          done()
        })
    })

    it('should fail at creating new user', function (done) {
      request.post('/api/users')
        .send({})
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(400)
          expect(response.body).to.be.an('object').that.includes({ success: false }, { error: '' })
          done()
        })
    })
  })

  describe('validate', function () {
    let testUserHash

    it('should get hash associated with newly created user', function (done) {
      request.get(`/api/users/${testUser._id}`)
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true })
          testUserHash = response.body.data.hash.hash
          done()
        })
    })

    it('should not validate new user with test user hash because password is too short', function (done) {
      request.put(`/api/auth/validate/${testUserHash}`)
        .send({ password: 'asd' })
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          console.log(response.body)
          expect(response.statusCode).to.equal(400)
          expect(response.body).to.be.an('object').that.includes({ success: false }, { error: '' })
          done()
        })
    })
    it('should validate new user with test user hash', function (done) {
      request.put(`/api/auth/validate/${testUserHash}`)
        .send({ password: 'mismis' })
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          console.log(response.body)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: {} })
          done()
        })
    })
  })

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
