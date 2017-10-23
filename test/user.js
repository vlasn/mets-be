'use strict'

const chai = require('chai')
const request = require('supertest').agent('http://localhost:3000')
const expect = chai.expect
const { findHashById, deleteUserById } = require('./helpers')
var testUser
// testkasutaja kustutamiseks luua after(function() {})

describe('user', function () {
  after(function () {
    const isDeleted = deleteUserById(testUser._id)
    console.log(`Test user deletion was ${isDeleted ? 'successful' : 'unsucessful'}`)
  })

  describe('create', function () {
    it('should create new user', function (done) {
      this.timeout(5000)
      request.post('/api/users')
        .send({ 'personalData': { name: 'Manny', address: 'joogeva' }, email: 'm365@mingi.ee'})
        .set('Content-Type', 'application/json')
        .end(function (error, response) {
          if (error) console.log(error)
          expect(response.statusCode).to.equal(200)
          expect(response.body).to.be.an('object').that.includes({ success: true }, { data: {} })
          expect(response.body.data.role).to.equal('CLIENT')
          expect(response.body.data.personalData).to.deep.equal({ name: 'Manny', address: 'joogeva' })
          testUser = response.body.data
          console.log(testUser)
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
    it('should validate new user', function (done) {
      const testUserHash = findHashById(testUser._id)
      console.log('testuserhashh', testUserHash)

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
})
