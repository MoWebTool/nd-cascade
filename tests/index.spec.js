'use strict'

// var $ = require('nd-jquery')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var Cascade = require('../index')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/*globals describe,it*/

describe('Cascade', function() {

  it('new Cascade', function() {
    expect(Cascade).to.be.a('function')
    expect(new Cascade).to.be.a('object')
  })

})
