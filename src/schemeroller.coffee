## Schema
# (c)2014 Van Carney
#### A strict Schema implementation allowing key restriction and virtualization
global = module.exports ? window
# Schema = require './schema'
# Vector = require './vector'
GeoPoint = {lat:0, lng:0}
_kinds = {}
class SchemaRoller
  'use strict'
  constructor: ->
    _kinds =
      Array:Array
      Boolean:Boolean
      Buffer:ArrayBuffer
      Date:Date
      GeoPoint:GeoPoint
      Number:Number
      Object:Object
      String:String
      Function:Function
    @getClass = (name)->
      _kinds[name] || null
    @registerClass = (name, clazz)->
      _kinds[name] = clazz
    @unregisterClass = (name)->
      delete _kinds[name] if _kinds.hasOwnProperty name
module.exports.SchemaRoller = new SchemaRoller
module.exports.SchemaRoller.Vector = require './vector'
module.exports.SchemaRoller.Schema = require './schema'
