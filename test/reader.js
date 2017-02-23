var expect = require('chai').expect
var Reader = require('../models/reader/reader')

describe('Reader Base', function(){
  it('respond to base functions', function(){
    r = new Reader(null, null, null)
    expect(r).to.respondTo('canRead');
    expect(r).to.respondTo('open');
    expect(r).to.respondTo('close');
  })
})
