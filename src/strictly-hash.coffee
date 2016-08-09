## Hash
# (c)2014 Van Carney
#### A strict Hash implementation allowing key restriction and virtualization
global = exports ? window
class global.Hash
  'use strict'
  constructor:(_o={}, restrict_keys=[], restrict_values={}) ->
    object = {}
    # escapes keys that append __
    escapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key}%" else "#{key}"
    # unescapes unsafe key
    unescapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key.substr 0, key.length - 1}" else "#{key}"
    _kinds =
      Array:Array
      Boolean:Boolean
      Number:Number
      Object:Object
      String:String
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
    #> gets key/value from virtualized object
    @get = (key)=>
      object[escapeKey key]
    #### @set(key, value)
    #> sets key/value to virtualized object
    @set = (key, value)=>
      # tests if key is string
      if typeof key is 'string'
        # returns if restricted and key is not in  list
        return @ if restrict_keys.length and 0 > restrict_keys.indexOf key
        if restrict_values.hasOwnProperty key
          if restrict_values[key].match /^cast:+/
            kind = restrict_values[key].split(':')[1]
            return @ unless _kinds[kind]
            value = (_kinds[kind]) value
          if restrict_values[key].match /^class:+/
            kind = restrict_values[key].split(':')[1]
            return @ unless global.Hash.__classes.hasOwnProperty kind
            value = ((clazz, val) => return new clazz(val)) global.Hash.getClass(kind), value
          return @ unless validValue value, restrict_values[key]
        # sets kay/value to object
        object[escapeKey key] = value
      # recurses if 'key 'is an object (batch setting)
      else if typeof key is 'object'
        # calls set with nested key value pair
        for k,v of key
          @set k, v
      # returns self for chaining
      @
    for key in Object.keys _o
      @set key, _o[key]
    #### @has(key)
    #> tests for key existance
    @has = (key) =>
      object.hasOwnProperty escapeKey key
    #### @del(key)
    #> removes key from hash
    @del = (key)=>
      delete object[escapeKey key] if @has key
    #### @forEach(iterator, scope)
    #> traverses hash, calling iterator on each node
    @forEach = (iterator, scope) =>
      _results = []
      for key of object
        continue unless object.hasOwnProperty key
        _results.push iterator.call scope, object[key], unescapeKey key
      _results
    #### @keys()
    #> returns object keys
    @keys = =>
      keys = []
      @forEach (value, key) =>
        keys.push key
      keys
    #### @valueOf()
    #> returns object
    @valueOf = => object
    #### @toJSON()
    #> returns object
    @toJSON  = => object
    #### @toString(pretty)
    #> returns string representation of hash, if pretty is `true` will format the string for readability
    @toString = (pretty=false) =>
      JSON.stringify @toJSON(), null, (if pretty then 2 else undefined)
    #### @canFreeze()
    #> returns true if environment supports Object.freeze
    @canFreeze = =>
      typeof Object.freeze is 'function'
    #### @freeze()
    #> freezes Hash object if feature supported by environment
    @freeze = =>
      if @canFreeze()
        Object.freeze @
        Object.freeze object
      @
    #### @isFrozen()
    #> returns true if Hash is frozen
    @isFrozen = =>
      if @canFreeze() then Object.isFrozen object else false
    #### @canSeal()
    #> returns true if environment supports Object.seal
    @canSeal = =>
      typeof Object.seal is 'function'
    #### @seal()
    #> seals Hash object if feature supported by environment
    @seal = =>
      if @canSeal()
        Object.seal @
        Object.seal object
      @
    #### @isSealed()
    #> returns true if Hash is sealed
    @isSealed = =>
      if @canSeal() then Object.isSealed object else false
    #### @canPreventExtensions()
    #> returns true if environment supports Object.canPreventExtensions
    @canPreventExtensions = =>
      typeof Object.preventExtensions is 'function'
    #### @isExtensible()
    #> returns false if Hash is not Extensible
    @isExtensible = =>
      if @canPreventExtensions() then Object.isExtensible object else true
    #### @preventExtensions()
    #> prevent Extensability for Hash object if feature supported by environment
    @preventExtensions = =>
      if @canPreventExtensions()
        Object.preventExtensions @
        Object.preventExtensions object
      @
global.Hash.__classes =
  Hash:global.Hash
global.Hash.getClass = (name)->
  global.Hash.__classes[name] || null
global.Hash.registerClass = (name, clazz)->
  global.Hash.__classes[name] = clazz
global.Hash.unregisterClass = (name)->
  delete global.Hash.__classes[name] if global.Hash.__classes.hasOwnProperty name