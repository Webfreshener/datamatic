{Fun}  = require 'fun-utils'
Vector = require './vector'
SchemaValidator = require './_schemaValidator'
ValidatorBuilder = (require './_validatorBuilder').getInstance()
if `typeof Object.assign != 'function'`
  Object.assign = (target) ->
    'use strict'
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
class Schema
  'use strict'
  constructor:(_o={}, opts=extensible:false) ->
    _object = {}
    _required_elements = []
    # escapes keys that append __
    escapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key}%" else "#{key}"
    # unescapes unsafe key
    unescapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key.substr 0, key.length - 1}" else "#{key}"
    _validators = {}

    # traverses elements of schema
    if _o.elements?
      for _oE in Object.keys _o.elements
        _required_elements.push _oE if _o.elements[_oE].required? and _o.elements[_oE].required
    ##> helper method to test if field requirements are met
    _hasRequiredFields = (obj)=>
      oKeys = Object.keys obj
      for key in _required_elements
        return "required property '#{key}' is missing" unless 0 <= oKeys.indexOf key
      true
    # attempts to validate provided `schema` entries
    _schema_validator = new SchemaValidator _o, opts
    # throws error if error messagereturned
    throw eMsg if typeof (eMsg = _schema_validator.isValid()) is 'string'
    
    # builds validations from SCHEMA ENTRIES
    (_walkSchema = (obj)=>
      for _k in (if (Array.isArray obj) then obj else Object.keys obj)
        ValidatorBuilder.create obj[_k], _k
        _walkSchema obj[_k].elements if obj[_k].hasOwnProperty "elements" and typeof obj[_k].elements is "object"
    ) _o.elements || {}
    _validate = (key, value)->
      return "'#{key}' is not a valid schema property" unless 0 <= ValidatorBuilder.list()?.indexOf key
      return "validator for '#{key}' failed. #{msg}" if typeof (msg = ValidatorBuilder.exec key, value) is 'string'
      true  
    validValue = (val, restrict)->
      if typeof restrict is 'string'
        # tests for type match
        if restrict.match /^(typeof|cast)+:+/
          return typeof val == (restrict.split(':')[1] || "").toLowerCase()
        if restrict.match /^class:+/
          return typeof val is 'object'
        else
          # tests string comparison
          return val is restrict
      else
        # tests enumeration
        if typeof restrict is 'object' and restrict.length
          return 0 <= restrict.indexOf val 
      # unknown restriction
      false
    #### @get(key)
    #> gets key/value from virtualized _object
    @get = (key)=>
      _object[escapeKey key]
    #### @set(key, value)
    #> sets key/value to virtualized _object
    @set = (key, value)=>
      # recurses if 'key 'is an _object (batch setting)
      if typeof key is 'object'
        return _f if typeof (_f = _hasRequiredFields Object.assign {}, _object, key) is 'string'
        # calls set with nested key value pair
        for k,v of key
          return eMsg if typeof (eMsg = @set k, v) is 'string'
      else
        _schema = _o.elements ? _o
        for k in key.split '.'
          _schema = if _schema.elements? then _schema.elements[k] else _schema[k]
          return "element '#{k}' is not a valid element" unless _schema?
        if typeof value is 'object'
          unless Array.isArray value
            throw e unless (e = (s = new Schema _schema.elements ? _schema).set value) instanceof Schema
            value = s
          else
            getKinds = =>
              _elems = [] #_schema
              unless Array.isArray _elems
                _elems = Object.keys(_schema).map (key)=> _schema[key]
              _elems.map (el)-> el.type
              if _elems.length then _elems else null
            value = (new Schema _schema).set new Vector getKinds() || '*', value
        else
          return eMsg if (typeof (eMsg = _validate key, value)) == 'string'
        _object[key] = value
      # returns self for chaining
      @
    @validate = (cB)=>
      _validate cB
    #### @has(key)
    #> tests for key existance
    @has = (key) =>
      _object.hasOwnProperty escapeKey key
    #### @del(key)
    #> removes key from Schema
    @del = (key)=>
      delete _object[escapeKey key] if @has key
    #### @forEach(iterator, scope)
    #> traverses Schema, calling iterator on each node
    @forEach = (iterator, scope) =>
      _results = []
      for key of _object
        continue unless _object.hasOwnProperty key
        _results.push iterator.call scope, _object[key], unescapeKey key
      _results
    #### @keys()
    #> returns _object keys
    @keys = =>
      keys = []
      @forEach (value, key) =>
        keys.push key
      keys
    #### @valueOf()
    #> returns _object
    @valueOf = => _object
    #### @toJSON()
    #> returns _object
    @toJSON  = => _object
    #### @toString(pretty)
    #> returns string representation of Schema, if pretty is `true` will format the string for readability
    @toString = (pretty=false) =>
      JSON.stringify @toJSON(), null, (if pretty then 2 else undefined)
    #### @canFreeze()
    #> returns true if environment supports Object.freeze
    @canFreeze = =>
      typeof Object.freeze is 'function'
    #### @freeze()
    #> freezes Schema _object if feature supported by environment
    @freeze = =>
      if @canFreeze()
        Object.freeze @
        Object.freeze _object
      @
    #### @isFrozen()
    #> returns true if Schema is frozen
    @isFrozen = =>
      if @canFreeze() then Object.isFrozen _object else false
    #### @canSeal()
    #> returns true if environment supports Object.seal
    @canSeal = =>
      typeof Object.seal is 'function'
    #### @seal()
    #> seals Schema _object if feature supported by environment
    @seal = =>
      if @canSeal()
        Object.seal @
        Object.seal _object
      @
    #### @isSealed()
    #> returns true if Schema is sealed
    @isSealed = =>
      if @canSeal() then Object.isSealed _object else false
    #### @canPreventExtensions()
    #> returns true if environment supports Object.canPreventExtensions
    @canPreventExtensions = =>
      typeof Object.preventExtensions is 'function'
    #### @isExtensible()
    #> returns false if Schema is not Extensible
    @isExtensible = =>
      if @canPreventExtensions() then Object.isExtensible _object else true
    #### @preventExtensions()
    #> prevent Extensability for Schema _object if feature supported by environment
    @preventExtensions = =>
      if @canPreventExtensions()
        Object.preventExtensions @
        Object.preventExtensions _object
      @
SchemaRoller = if module?.parent.exports then module.parent.exports.SchemaRoller else require 'schemaroller'
SchemaRoller.registerClass "Schema", Schema
module.exports = Schema