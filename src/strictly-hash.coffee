## Hash
# (c)2014 Van Carney
#### A strict Hash implementation allowing key restriction and virtualization
global = exports ? window
class global.Hash
  'use strict'
  constructor:(object={}, restrict_keys=[]) ->
    # escapes keys that append __
    escapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key}%" else "#{key}"
    # unescapes unsafe key
    unescapeKey = (key) ->
      if key.length > 2 and key.charCodeAt(0) is 95 and key.charCodeAt(1) is 95 then "#{key.substr 0, key.length - 1}" else "#{key}"
    #### Hash::get(key)
    #> gets key/value from virtualized object
    Hash::get = (key)=>
      object[escapeKey key]
    #### Hash::set(key, value)
    #> sets key/value to virtualized object
    Hash::set = (key, value)=>
      # tests if key is string
      if typeof key is 'string'
        # returns if restricted and key is not in  list
        return @ if restrict_keys.length and 0 > restrict_keys.indexOf key
        # sets kay/value to object
        object[escapeKey key] = value
      # recurses of key is an object
      else if typeof key is 'object'
        # calls set with nested key value pair
        for k,v of key
          @set k, v
      # returns self for chaining
      @
    #### Hash::has(key)
    #> tests for key existance
    Hash::has = (key) =>
      object.hasOwnProperty escapeKey key
    #### Hash::del(key)
    #> removes key from hash
    Hash::del = (key)=>
      delete object[escapeKey key] if @has key
    #### Hash::forEach(iterator, scope)
    #> traverses hash, calling iterator on each node
    Hash::forEach = (iterator, scope) =>
      _results = []
      for key of object
        continue unless object.hasOwnProperty key
        _results.push iterator.call scope, object[key], unescapeKey key
      _results
    #### Hash::keys()
    #> returns object keys
    Hash::keys = =>
      keys = []
      @forEach (value, key) =>
        keys.push key
      keys
    #### Hash::valueOf()
    #> returns object
    Hash::valueOf = => object
    #### Hash::toJSON()
    #> returns object
    Hash::toJSON  = => object
    #### Hash::toString(pretty)
    #> returns string representation of hash, if pretty is `true` will format the string for readability
    Hash::toString = (pretty=false) =>
      JSON.stringify @toJSON(), null, (if pretty then 2 else undefined)
    #### Hash::canFreeze()
    #> returns true if environment supports Object.freeze
    Hash::canFreeze = =>
      typeof Object.freeze is 'function'
    #### Hash::freeze()
    #> freezes Hash object if feature supported by environment
    Hash::freeze = =>
      if @canFreeze()
        Object.freeze @
        Object.freeze object
      @
    #### Hash::isFrozen()
    #> returns true if Hash is frozen
    Hash::isFrozen = =>
      if @canFreeze() then Object.isFrozen object else false
    #### Hash::canSeal()
    #> returns true if environment supports Object.seal
    Hash::canSeal = =>
      typeof Object.seal is 'function'
    #### Hash::seal()
    #> seals Hash object if feature supported by environment
    Hash::seal = =>
      if @canSeal()
        Object.seal @
        Object.seal object
      @
    #### Hash::isSealed()
    #> returns true if Hash is sealed
    Hash::isSealed = =>
      if @canSeal() then Object.isSealed object else false
    #### Hash::canPreventExtensions()
    #> returns true if environment supports Object.canPreventExtensions
    Hash::canPreventExtensions = =>
      typeof Object.preventExtensions is 'function'
    #### Hash::isExtensible()
    #> returns false if Hash is not Extensible
    Hash::isExtensible = =>
      if @canPreventExtensions() then Object.isExtensible object else true
    #### Hash::preventExtensions()
    #> prevent Extensability for Hash object if feature supported by environment
    Hash::preventExtensions = =>
      if @canPreventExtensions()
        Object.preventExtensions @
        Object.preventExtensions object
      @