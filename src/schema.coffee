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
        if obj[_k].hasOwnProperty "elements" and typeof obj[_k].elements is "object"
          _walkSchema obj[_k].elements
    ) _o.elements || {}
    _validate = (key, value)->
      unless 0 <= ValidatorBuilder.list()?.indexOf key
        return "'#{key}' is not a valid schema property" unless opts.extensible
      return "validator for '#{key}' failed. #{msg}" if typeof (msg = ValidatorBuilder.exec key, value) is 'string'
      true  
    _getKinds = (_s) =>
      _elems = Object.keys(_s).map (key)=>
        if _s[key].type? then _s[key].type else null
      _elems = _elems.filter (elem)-> 
        elem != null
      if _elems.length then _elems else null
    #### @get(key)
    #> gets key/value from virtualized _object
    @get = (key)=>
      _object[key]
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
        _extensible = if _o.extensible? then _o.extensible else opts.extensible || false
        for k in key.split '.'
          _extensible = _schema[k].extensible if _schema[k]? and _schema[k].hasOwnProperty 'extensible'
          _schema = if _schema.elements? then _schema.elements[k] else _schema[k] 
          unless _schema?
            return "element '#{k}' is not a valid element" unless _extensible
            _schema = 
              type: '*'
              required: true
              extensible: false
        if typeof value is 'object'
          if _schema?
            unless Array.isArray value
              _s = new Schema (_schema.elements ? _schema), extensible: _extensible
            else
              if Array.isArray (_kinds = _getKinds _schema)
                _kinds = _kinds.map (itm)->
                  switch (typeof itm)
                    when 'string'
                      return itm
                    when 'object'
                      return itm.type if itm.hasOwnProperty 'type'
                _kinds = _kinds.filter (itm)-> itm?
                _kinds = if _kinds.length then _kinds else '*'
              _s = new Vector (_kinds || '*')
          return "'#{key}' was invalid" unless _schema?
          value = _s[if (_s instanceof Vector) then 'replaceAll' else 'set'] value
          return value if (typeof value) is 'string'
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
      _object.hasOwnProperty key
    #### @del(key)
    #> removes key from Schema
    @del = (key)=>
      delete _object[key] if @has key
    #### @forEach(iterator, scope)
    #> traverses Schema, calling iterator on each node
    @forEach = (iterator, scope) =>
      _results = []
      for key of _object
        continue unless _object.hasOwnProperty key
        _results.push iterator.call scope, _object[key], key
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