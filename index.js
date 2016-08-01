/**
 * @module Cascade
 * @author lzhengms <lzhengms@gmail.com>
 */

'use strict'

var $ = require('nd-jquery')
var Overlay = require('nd-overlay')
var Template = require('nd-template')

//sort
function quickSort(key) {
  return function(arr) {
    if (arr.length <= 1) {
      return arr
    }
    var left = []
    var right = []
    var proitIndex = Math.floor(arr.length / 2)
    var proit = arr.splice(proitIndex, 1)[0]
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] < proit[key]) {
        left.push(arr[i])
      } else {
        right.push(arr[i])
      }
    }
    return quickSort(key)(left).concat(proit, quickSort(key)(right))
  }
}

//'{"province":"福建省","provinceCode":"350000","city":"莆田市","cityCode":"350300","district":"仙游县","districtCode":"350322"}'
var Cascade = Overlay.extend({

  Implements: [Template],

  attrs: {
    classPrefix: 'ui-cascade',
    titleActiveClass: 'ui-cascade-active',
    itemSelectedClass: 'ui-cascade-selected',
    itemHoverClass: 'ui-cascade-item-hover',
    triggerClass: 'ui-cascade-trigger',
    // 重写默认的z-index: 99 => 999
    zIndex: 999,

    // 支持是否必须所有Tab全选才设置值，默认值：true
    force: true,

    trigger: {
      value: null,
      getter: function(val) {
        return $(val).eq(0)
      }
    },
    triggerTpl: '<a href="javascript:;"></a>',

    template: require('./src/cascade.handlebars'),
    _options: require('./src/options.handlebars'),
    index: 0,
    align: {
      baseXY: [0, '100%-1px']
    },
    delimiter: '/',

    data: null,
    tabs: null,
    selected: null,

    value: {
      value: null,
      getter: function() {
        var trigger = this.get('originTrigger')[0]
        return trigger.value || trigger.placeholder
      },
      setter: function(val) {

        if (typeof val === 'object' || Array.isArray(val)) {
          val = JSON.stringify(val)
        }

        this.get('originTrigger')[0].value = val || ''
        return val
      }
    },

    inFilter: function(value) {
      return value
    },

    outFilter: function(data) {
      return data
    },

    outValues: function() {
      return this.getValues().splice(-1)
    }
  },

  events: {
    'click [data-role="select-tab"]': function(e) {
      this.set('index', $(e.currentTarget).index())
    },
    'click [data-role="select-item"]': function(e) {
      var target = $(e.currentTarget)
      var selectedClass = this.get('itemSelectedClass')
      target.addClass(selectedClass).siblings().removeClass(selectedClass)
      this.select(target)
    },
    'mouseenter [data-role="select-item"]': function(e) {
      $(e.currentTarget).addClass(this.get('itemHoverClass'))
    },
    'mouseleave [data-role="select-item"]': function(e) {
      $(e.currentTarget).removeClass(this.get('itemHoverClass'))
    }
  },

  initAttrs: function(config) {
    Cascade.superclass.initAttrs.call(this, config)

    var trigger = this.get('trigger')
    var newTrigger = $(this.get('triggerTpl')).addClass(this.get('triggerClass'))

    trigger.after(newTrigger).css({
      position: 'absolute',
      left: '-9999px',
      zIndex: -100
    })

    this.set('originTrigger', trigger)
    this.set('trigger', newTrigger)
    this.set('model', {
      tabs: this.get('tabs')
    })
  },

  setup: function() {
    this._bindEvents()
    this._alignDefaultValue()
    this._blurHide(this.get('trigger'))
    this.setTriggerContent(this.get('inFilter').call(this, this.get('value')))
    Cascade.superclass.setup.call(this)
  },

  render: function() {
    Cascade.superclass.render.call(this)
    this._setTriggerWidth()
    return this
  },

  select: function(target) {
    var that = this,
      value = target.data('id'),
      text = target.text(),
      length = this.get('tabs').length,
      index = this.get('index'),
      next = index + 1,
      selectList = this.get('selected') || []

    selectList.some(function(item, i) {
      if (item.index === index) {
        selectList.splice(i, 1)
        return true
      }
    })

    selectList.push({
      index: index,
      value: value,
      text: text
    })

    //对selectList按照index排序
    selectList = quickSort('index')(selectList)
    this.set('length', next)
    next >= length ? this.hide() : (function() {
      //选了除了最后一个面板都要
      selectList.splice(next, length - next)
      //清空后面的板块内容
      that._getWraps(index).nextAll('div').empty()
      //切换到下一个面板
      that.set('index', next)
      //重置值
      that.set('value', '')
      //设置这个板块的数据
      /** index   当前板块的索引
       *  value   在当前板块选中的项的id
       */
      that.trigger('setData', next, value)
    })()

    this.set('selected', selectList.slice(0))

    this.setValues()
  },

  //set回调
  _onRenderIndex: function(index) {
    var wraps = this._getWraps(),
      tabs = this._getTabs(),
      curTab = tabs.eq(index)

    curTab.addClass(this.get('titleActiveClass'))
    curTab.siblings().removeClass(this.get('titleActiveClass'))
    wraps.hide()
    wraps.eq(index).show()
  },

  _onRenderData: function(data) {
    var model = this.get('model')
    model.list = data || []
    this._getWraps(this.get('index')).html(this.get('_options')(model))
  },

  _onRenderSelected: function(list) {
    var values = [],
      texts = []

    list.forEach(function(item) {
      values.push(item.value)
      texts.push(item.text)
    })

    this.set('values', values)
    this.set('texts', texts)

    //处理成自己想要的数据格式
    this.get('outFilter').call(this, list)
  },

  //私有方法
  _getWraps: function(index) {
    var wraps = this.$('[data-role="content"]').children('div')
    return typeof index === 'undefined' ? wraps : wraps.eq(index)
  },

  _getTabs: function() {
    return this.$('[data-role="select-tab"]')
  },

  _bindEvents: function() {
    this.delegateEvents(this.get('trigger'), 'click', function(e) {
      e.preventDefault()
      this.get('visible') ? this.hide() : this.show()
    })
  },

  _alignDefaultValue: function() {
    this.get('align').baseElement = this.get('trigger')
  },

  _setTriggerWidth: function() {
    var originTrigger = this.get('originTrigger')
    var trigger = this.get('trigger')

    // var elementWidth = this.element.outerWidth()
    var width = originTrigger.outerWidth()
    // var  width = originTriggerOutWidth > elementWidth ? originTriggerOutWidth : elementWidth

    // newTigger 与 overlay 的宽度始终与 originTrigger 保持一致
    trigger.css('width', width)
    // 因为 trigger 的宽度可能受 CSS（如 max-width） 限制，
    // 最后将 element 的宽度设置为与 trigger 等宽
    this.element.css('width', width)
  },

  //接口方法
  setTriggerContent: function(text) {
    var trigger = this.get('trigger'),
      con = trigger.find('[data-role="content"]')
    if (con && con.length) {
      con.html(text)
    } else {
      trigger.html(text)
    }
  },

  getValues: function() {
    return this.get('values')
  },

  getTexts: function() {
    return this.get('texts')
  },

  getSelected: function() {
    return this.get('selected')
  },

  setValues: function() {
    //设置要显示的数据和提交的数据
    this.setTriggerContent(this.getTexts().join(this.get('delimiter')))
    //必须全部选择了才设置值
    if (this.get('force') && this.get('length') === this.get('tabs').length) {
      this.set('value', this.get('outValues').call(this, this.getSelected()))
    } else if (!this.get('force') && this.get('length') >= 1){
      this.set('value', this.get('outValues').call(this, this.getSelected()))
    }
  }

})

module.exports = Cascade
