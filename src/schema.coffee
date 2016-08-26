{Fun}  = require 'fun-utils'
Vector = require './vector'
String::ucfirst = ->
  @charAt(0).toUpperCase() + @substr 1

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
    _schemaKeys = 
      type: {
        type: ['String', 'Function', 'Object']
        required: true
      }
      required: 'Boolean'
      extensible: 'Boolean'
      restrict: 'String'
      validate: 'Function'
    # escapes keys that append __
    escapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key}%" else "#{key}"
    # unescapes unsafe key
    unescapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key.substr 0, key.length - 1}" else "#{key}"

    _validators = {}
    ## _buildValidator
    # accepts: 
    _buildValidator = (_ref, _path)=>
      _v = [_ref]
      if Array.isArray _ref
        _v = _ref.map (_s) => _buildValidator _s, path
      _validators[_path] = (value)=>
        for vItm in _v
          if vItm.required and !(value?)
            return false
          switch typeof value
            when 'string'
              return false unless vItm.type.match /^string$/i
              return false if vItm.restrict? and (new RegExp vItm.restrict).exec value
              return true
            when 'function'
              _x = if typeof vItm is 'string' then vItm else Fun.getConstructorName vItm
              return _x == Fun.getConstructorName value
            when 'object'
              return false unless value.validate?()
            else
              _x = if typeof vItm.type is 'string' then SchemaRoller.getClass vItm.type else vItm.type
              return _x? and value instanceof _x
        # should not be here
        false
    # traverses elements of schema
    if _o.elements?
      for _oE in Object.keys _o.elements
        _required_elements.push _oE if _o.elements[_oE].required? and _o.elements[_oE].required    
    ##> helper method to test if field requirements are met
    _hasRequiredFields = (obj)=>
      oKeys = Object.keys obj
      for key in _required_elements
        return false unless 0 <= oKeys.indexOf key
      true
    _allowed_keys = Object.keys _o
    _sKeys = Object.keys _schemaKeys
    rx = new RegExp "^((#{_sKeys.join '|'})+,?){#{_sKeys.length}}$"
    _validateTypeString = (key, _type)=>
      unless (SchemaRoller.getClass _type.ucfirst())?
        throw "type '<#{_type}>' for schema element '#{key}' was invalid"
      true
    _validateSchemaEntry = (key, params)=>
      throw "#{key} was null or undefined" unless params?
      return _validateTypeString key, params if typeof params == 'string'
      if typeof params == 'object'
        unless params.hasOwnProperty "type"
          throw "value for schema element '#{key}' was malformed. Property 'type' was missing"
        _c = SchemaRoller.getClass params.type.ucfirst()
        unless (_c = SchemaRoller.getClass params.type.ucfirst())?
          throw "value for schema element '#{key}' has invalid type '<#{params.type}>'"
        for sKey in Object.keys params
          throw "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
          if typeof params[sKey] == "string"
            _kind = params[sKey].ucfirst()
            throw "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
            if typeof _schemaKeys[sKey] == 'object'
              _type = _schemaKeys[sKey].type
              unless Array.isArray _type
                throw "invalid schema element '#{key}' requires type '#{_type}' type was '<#{_kind}>'" unless _type == _kind
              else
                throw "invalid schema element '#{key}' requires type '#{_type}' type was '<#{_kind}>'" unless 0 <= _type.indexOf _kind
            else
              _validateSchemaEntry "#{key}.#{sKey}", params[sKey]
          else
            _validateSchemaEntry "#{key}.#{sKey}", params[sKey]
      else
        _t = typeof params
        unless _t == 'function'
          # tests for everything that's not a string, _object or function
          throw "value for schema element '#{key}' has invalid type '<#{_t}>'" unless _schemaKeys[key.split('.').pop()] == _t.ucfirst()
        else
          # tests for function's constructor name
          throw "value for schema element '#{key}' has invalid class or method '<#{_fn}>'" unless (_fn = Fun.getConstructorName params) == _schemaKeys[key] 
    # validates SCHEMA ENTRIES
    for _oKey in Object.keys _o
      switch typeof _o[_oKey]
        when "string"
          obj = {}
          obj[_oKey] = {
            type: _o[_oKey].ucfirst(), 
            required: false
          }
          _o = Object.assign _o, obj
          _validateSchemaEntry _oKey, _o[_oKey]
        when "object"
          unless Array.isArray _o[_oKey]
            _validateSchemaEntry _oKey, _o[_oKey]
          else
            for _s in _o[_oKey]
              if typeof _o[_oKey][_s] is 'string'
                _validateTypeString _oKey, _o[_oKey][_s]
              else
                _validateSchemaEntry _oKey, _o[_oKey][_s] 
        else
          throw "value for schema element '#{_oKey}' was invalid"
    # builds validations from SCHEMA ENTRIES
    (_walkSchema = (obj)=>
      for _k in (if (Array.isArray obj) then obj else Object.keys obj)
        _buildValidator obj[_k], _k 
        _walkSchema obj[_k].elements if obj[_k].hasOwnProperty "elements" and typeof obj[_k].elements is "object"
    ) _o
    _validate = (key, value)->   
      return false unless _validators.hasOwnProperty key
      return msg unless (msg = _validators[key] value)
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
      # tests if key is string
      if typeof key is 'string'
        _schema = _o
        for k in key.split '.'
          _schema = _schema[k]
        if typeof value is 'object'
          unless Array.isArray value
            throw e unless (e = (s = new Schema _schema).set value) instanceof Schema
            value = s
          else
            getKinds = =>
              _elems = _schema.elements
              unless Array.isArray _elems
                _elems = Object.keys(_schema.elements).map (key)=> _schema.elements[key]
              _elems.map (el)-> el.type
              if _elems.length then _elems else null
            value = (new Schema _schema).set new Vector getKinds() || '*', value
        return false unless _validate key, value
        _object[key] = value
      # recurses if 'key 'is an _object (batch setting)
      else if typeof key is 'object'
        return false unless _hasRequiredFields Object.assign {}, _object, key
        # calls set with nested key value pair
        for k,v of key
          return false unless @set k, v
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