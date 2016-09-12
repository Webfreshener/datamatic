## Schema
# (c)2014 Van Carney
#### A strict Schema implementation allowing key restriction and virtualization
global = module.exports ? window

String::ucfirst = ->
  @charAt(0).toUpperCase() + @substr 1
GeoPoint = {lat:0, lng:0}
_kinds = {}
class SchemaRoller
  'use strict'
  constructor: ->
    _kinds =
      Array:Array
      ArrayBuffer:ArrayBuffer
      Boolean:Boolean
      Buffer:ArrayBuffer
      Date:Date
      GeoPoint:GeoPoint
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
      default: 'Boolean'
      elements: ['Array','Object']
    @getSchemaRef = ->
      _schemaRef
    @getDefaults = ->
      _def =
        type: '*'
        required: false
        extensible: false
module.exports = ->
  _s = new SchemaRoller
  _s.Schema = Schema
  _s.Vector = Vector
  _s.registerClass 'Schema', Schema
  _s.registerClass 'Vector', Vector
  _s
Schema = require './schema'
Vector = require './vector'