## Vector
# (c)2016 Van Carney
#### A strict Hash implementation allowing key restriction and virtualization
global = exports ? window
objUtil = require 'obj-utils'
class Vector
  'use strict'
  constructor:(_type, items...) ->
    _list = []
    unless Array.isArray _type
      _type = [_type] if typeof _type is 'string'
      _type = '*' unless typeof _type is 'function'
    _check = (item)->
      return true if _type is '*'
      console.log '\n\n--- _check ---'
      console.log 'item:'
      console.log item
      console.log '\n_type:'
      console.log _type
      console.log '------------'
      objUtil.isOfType item, _type
    @getItemAt = (idx)=>
      if _list.length = (idx + 1) then _list[idx] else null
    @setItemAt = (idx, item)=>
      return false unless _check item
      _list.splice idx, 0, item
      true
    @removeItemAt = (idx, item)=>
      return false unless  idx <= _list.length
      _list.splice idx, 1, item
    @replaceItemAt = (idx, item)=>
      return false unless _check item
      return false unless  idx <= _list.length
      _list.splice idx, 1 if idx <= _list.length
    @addItem = (item)=>
      @setItemAt _list.length, item
    @shift = =>
      _list.shift()
    @unshift = (items...)=>
      items.forEach (item)=> 
         @setItemAt 0, item
    @pop = =>
      _list.shift()
    @push = (items...)=>
      items.forEach (item)=> 
         @addItem item
    @reset = =>
      _list = []       
    @length = =>
      _list.length
    @sort = (func)=>
      _list.sort func
    @values = =>
      _list.values()
    @toString = =>
      _list.toString()
    @push items if items?
SchemaRoller = if module?.parent.exports then module.parent.exports.SchemaRoller else require 'schemaroller'
SchemaRoller.registerClass "Vector", Vector
module.exports = Vector 
