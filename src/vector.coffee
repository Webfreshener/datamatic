## Vector
# (c)2016 Van Carney
#### A strict Hash implementation allowing key restriction and virtualization
global  = exports ? window
objUtil = require 'obj-utils'
{Fun}   = require 'fun-utils'
class Vector
  'use strict'
  constructor:(_type, items...) ->
    _list = []
    unless Array.isArray _type
      _t = typeof _type
      _type = [_type] if _t is 'string'
      _type = [_type] if _t.match /^(function|object)$/
      _type = ['*'] if _t is null or _t is 'Function'
    _check = (item)->
      for _t in _type
        return true if (typeof _t is 'string') and _t.match /^(\*|ALL)$/
        return false unless _t = SchemaRoller.getClass _t
        return false unless objUtil.isOfType item, _t
      true
    @getItemAt = (idx)=>
      if _list.length = (idx + 1) then _list[idx] else null
    @setItemAt = (idx, item)=>
      return false unless _check item
      _list.splice idx, 0, item
      @
    @removeItemAt = (idx, item)=>
      return false unless  idx <= _list.length
      _list.splice idx, 1, item
    @replaceAll = (array)=>
      @reset()
      for itm in array
        @addItem itm
      @
    @replaceItemAt = (idx, item)=>
      return false unless _check item
      return false unless  idx <= _list.length
      _list.splice idx, 1 if idx <= _list.length
      @
    @addItem = (item)=>
      @setItemAt _list.length, item
    @shift = =>
      _list.shift()
    @unshift = (items...)=>
      items.forEach (item)=> 
         @setItemAt 0, item
      @
    @pop = =>
      _list.shift()
    @push = (items...)=>
      items.forEach (item)=> 
         @addItem item
      @
    @reset = =>
      _list = []
      @     
    @length = =>
      _list.length
    @sort = (func)=>
      _list.sort func
      @
    @values = =>
      _list.values()
    @toString = =>
      _list.toString()
    @push items if items?
SchemaRoller = (require './schemaroller')()
module.exports = Vector 
