'use strict'

var $ = require('nd-jquery')
var chai = require('chai')
var expect = chai.expect
var Cascade = require('../index')

var tabs = [{
    text: '一级',
    value: '一级'
  }, {
    text: '二级',
    value: '二级'
  }]

  var cities = [{
    text: '北京',
    value: '北京'
  }, {
    text: '上海',
    value: '上海'
  }, {
    text: '广州',
    value: '广州'
  }, {
    text: '深圳',
    value: '深圳'
  }]

  var dirs = [{
    text: '东',
    value: '东'
  }, {
    text: '南',
    value: '南'
  }, {
    text: '西',
    value: '西'
  }, {
    text: '北',
    value: '北'
  }]

function createCascade() {
  return new Cascade({
    trigger: '<input type="text" />',
    maxHeight: 300,
    tabs: tabs,
    afterRender: function() {
      this.set('data', cities) //设置1级数据
    }
  }).render()
  .on('setData', function(index, value) {
    var texts = this.get('texts') || []
    texts = texts.slice(0, index - 1)
    texts.push(value)

    this.set('data', dirs.slice(0))
  })
}

/*globals describe,it*/
describe('Cascade', function() {
  var cas
  before(function() {
    cas = createCascade()
  })

  after(function() {
    cas && cas.destroy()
  })

  it('new Cascade', function() {
    expect(Cascade).to.be.a('function')
    expect(cas).to.be.an('object')
  })

})

describe('show/hide', function() {
  var cas
  before(function() {
    cas = createCascade()
  })

  after(function() {
    cas && cas.destroy()
  })

  it('show', function() {
    cas.show()
    expect($('.ui-cascade').css('display')).to.equal('block')
  })

  it('hide', function() {
    cas.hide()
    expect($('.ui-cascade').css('display')).to.equal('none')
  })
})

describe('select level', function() {
  var cas
  before(function() {
    cas = createCascade()
    cas.show()
  })

  after(function() {
    cas && cas.destroy()
  })

  it('select-tab', function() {
    cas.$('.ui-cascade-tab').find('[data-role="select-tab"]')[0].click() //click 一级
    expect($('.ui-cascade-tab .ui-cascade-active')[0].innerHTML).to.equal('一级')
  })

  it('mouseenter select-item', function() {
    var e = $.Event('mouseenter')
    $(cas.$('.ui-cascade-content').find('[data-role="select-item"')[0]).trigger(e)
    expect(cas.$('.ui-cascade-content .ui-cascade-item-hover').length).to.equal(1)
  })

  it('mouseleave select-item', function() {
    var e = $.Event('mouseleave')
    $(cas.$('.ui-cascade-content').find('[data-role="select-item"')[0]).trigger(e)
    expect(cas.$('.ui-cascade-content .ui-cascade-item-hover').length).to.equal(0)
  })

  it('select-item', function() {
    cas.$('.ui-cascade-content').find('[data-role="select-item"')[0].click()// click 北京
    expect($('.ui-cascade-content .ui-cascade-selected')[0].innerHTML).to.equal('北京')
    expect($('.ui-cascade-tab .ui-cascade-active')[0].innerHTML).to.equal('二级')

    cas.$('.ui-cascade-content').find('[data-role="select-item"')[4].click()// click 东
    expect($('.ui-cascade').css('display')).to.equal('none')
  })

})
