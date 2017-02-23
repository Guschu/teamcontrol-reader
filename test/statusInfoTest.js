var expect = require('chai').expect
var StatusInfo = require('../models/statusInfo')

describe('StatusInfo', function(){
  describe('on Empty Initialization', function() {
    describe('Properties are Set correct', function(){
      it('should contain undefined values', function(){
        testObj = new StatusInfo()
        expect(testObj).to.have.property('title', undefined)
        expect(testObj).to.have.property('status', undefined)
        expect(testObj).to.have.property('message', undefined)
        expect(testObj).to.have.property('additional', undefined)
      })
    })
  })
  describe('on filled Initialization', function() {
    describe('properties should contain given values', function(){
      it('should contain undefined values', function(){
        testObj = new StatusInfo('TestTitle', 'TestStatus', 'TestMessage', 'TestAdditional')
        expect(testObj).to.have.property('title', 'TestTitle')
        expect(testObj).to.have.property('status', 'TestStatus')
        expect(testObj).to.have.property('message', 'TestMessage')
        expect(testObj).to.have.property('additional', 'TestAdditional')
      })
    })
  })
})
