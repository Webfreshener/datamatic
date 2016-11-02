## SchemaRoller
# (c)2016 Van Carney
#### A strict Schema implementation allowing key restriction and virtualization
'use strict'
_global = exports ? window
if `typeof Object.assign != 'function'`
  Object.assign = (target) ->
    throw new TypeError('Cannot convert undefined or null to object') unless target?
    target = Object target
    index  = 1
    while index < arguments.length
      source = arguments[index]
      if source?
        for key of source
          if Object::hasOwnProperty.call source, key
            target[key] = source[key]
      index = index + 1
    target
# unless _global? and _global.hasOwnProperty 'wfUtils'
'{{wfUtils}}'
_kinds = {}
class SchemaRoller
  constructor: ->
    _kinds =
      Array:Array
      ArrayBuffer:ArrayBuffer
      Boolean:Boolean
      Buffer:ArrayBuffer
      Date:Date
      Number:Number
      Object:Object
      String:String
      Function:Function
    @getClass = (classesOrNames...)=>
      for arg in classesOrNames
        if typeof arg is 'object'
          if Array.isArray arg
            _r = []
            for n in arg
              switch typeof n
                when 'string'
                  _r.push @getClass n
                when 'function'
                  _r.push n
                else
                  _r.push if Array.isArray n then @getClass.apply @, n else  null
            return (unless (0 <= _r.indexOf null) then _r : null)
          return null
        return (_kinds[arg]) ? null
      null
    @registerClass = (name, clazz)->
      _kinds[name] = clazz
    @unregisterClass = (name)->
      delete _kinds[name] if _kinds.hasOwnProperty name
    @listClasses = ->
      Object.keys _kinds
    @fromJSON = (json)->
      switch typeof json
        when 'string'
          return new Schema JSON.parse json
        when 'object'
          return new Schema json
       throw new Error "json must be either JSON formatted string or object"
    _schemaRef = 
      type:
        type: @listClasses()
        required: true
      required: 'Boolean'
      extensible: 'Boolean'
      restrict: 'String'
      validate: 'Function'
      default: '*'
      elements: ['Array','Object']
    @getSchemaRef = ->
      _schemaRef
    @getDefaults = ->
      _def =
        type: '*'
        required: false
        extensible: false
(module?.exports ? window)['SchemaRoller'] = ->
  '{{classes}}'
  _schemaroller_ = new SchemaRoller
  _schemaroller_.registerClass 'Schema', _schemaroller_.Schema = Schema
  _schemaroller_.registerClass 'Vector', _schemaroller_.Vector = Vector
  _sKeys = Object.keys _schemaroller_.getSchemaRef()
  _schemaroller_.rx ?= new RegExp "^((#{_sKeys.join '|'})+,?){#{_sKeys.length}}$"
  _schemaroller_
