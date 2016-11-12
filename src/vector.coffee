## Vector
# (c)2016 Van Carney
#### A strict Hash implementation allowing key restriction and virtualization
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
        return false unless _t = _schemaroller_.getClass _t
        return false unless _global.wf.wfUtils.Obj.isOfType item, _t
      true
    @validate = ()=>
      _path = @path()
      _validator = ValidatorBuilder.getInstance()
      console.log ValidatorBuilder.getInstance().list()
      # return true
      _list.forEach (itm)=>
        return e if typeof (e = _validator.exec _path, itm) is 'string'
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
    @valueOf = =>
      _list
    @toString = =>
      _list.toString()
    if items[items.length - 1] instanceof _metaData
      _mdRef = items[items.length - 1]
      items.splice items.length - 1, 1
      # items = items[0] if items.length is 1 and Array.isArray items[0]
    else
      _mdRef = new _metaData @, _path:'', _root: @
    @objectID = =>
      _mdRef.get '_id'
    @root = =>
       _mdRef.get '_root'
    @path = =>
      _mdRef.get '_path'
    @parent = =>
      return null unless (_root = @root())? instanceof Schema or _root instanceof Vector
      _root.get @path().split('.').pop().join '.'
    # add all items into collection
    @push items if items? 
