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
        _path = if (_path = @path()).length then _path else 'root element'
        unless 0 <= oKeys.indexOf key
          console.log _required_elements
          console.log obj
          return "required property '#{key}' is missing for '#{_path}'"
      true
    # attempts to validate provided `schema` entries
    _schema_validator = new SchemaValidator _o, opts
    # throws error if error messagereturned
    throw eMsg if typeof (eMsg = _schema_validator.isValid()) is 'string'
    # builds validations from SCHEMA ENTRIES
    (_walkSchema = (obj, path)=>
      for _k in (if (Array.isArray obj) then obj else Object.keys obj)
        objPath = if path? and 1 <= path.length then"#{path}.#{_k}" else _k
        ValidatorBuilder.getInstance().create obj[_k], objPath
        if (obj[_k].hasOwnProperty 'elements') and (typeof obj[_k].elements is 'object')
          unless Array.isArray obj[_k].elements
            _walkSchema obj[_k].elements, objPath
          else
            for item in obj[_k].elements
              _walkSchema item, objPath
    ) _o.elements || {}
    # console.log ValidatorBuilder.getInstance().list()
    _validate = (key, value)->
      # key = if value instanceof _metaData then value.get( '_path' ) else value.getPath()
      # return "object provided was not a valid subclass of Schema" unless value instanceof Schema
      # return "object provided was malformed" unless typeof (key = value.getPath?()) is 'string'
      unless 0 <= ValidatorBuilder.getInstance().list()?.indexOf key
        _l = ValidatorBuilder.getInstance().list()
        _path = []
        for k,i in key.split '.'
          _path[i] = k
          _p = _path.join '.'
          _path[i] = '*' unless 0 <= _l.indexOf _p       
        unless _ref =  ValidatorBuilder.getInstance().get _p
          return "'#{key}' is not a valid schema property" unless opts.extensible
        ValidatorBuilder.getInstance().set key, _ref 
      return msg if typeof (msg = ValidatorBuilder.getInstance().exec key, value) is 'string'
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
          _key = if @parent().path()?.length then "#{@parent().path()}.#{k}" else k
          unless _schema?
            return "element '#{k}' is not a valid element" unless _extensible
            _schema = 
              type: '*'
              required: true
              extensible: false
          if typeof value is 'object'
            unless Array.isArray value
              _opts = {extensible: _extensible}
              _md = new _metaData @, _path: _key, _root: @root()
              _s = new Schema (_schema.elements ? _schema), _opts, _md
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
                _s = new Vector (_kinds || '*'), new _metaData @, _path:key
            return "'#{key}' was invalid" unless _schema? and _s? and typeof _s is 'object'
            value = _s[if (_s instanceof Vector) then 'replaceAll' else 'set'] value
            return value if (typeof value) is 'string'
          else
            unless key is "_root" # and @ instanceof _metaData
            
              return eMsg if (typeof (eMsg = _validate _key, value)) == 'string'
          _object[key] = value
      # returns self for chaining
      @
    @validate = ()=>
      _path = @path()
      # return true
      for _k in ValidatorBuilder.getInstance().list()
        _path = if _path.length > 0 then "#{_path}.#{_k}" else _k
        return e if typeof (e = _validate _k, @root().get _k) is 'string'
      true       
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
    @valueOf = =>
      _object
    #### @toJSON()
    #> returns _object
    @toJSON  = =>
      _o = {}
      _derive = (itm)->
        if itm instanceof Schema
          return _derive itm.toJSON()
        if itm instanceof Vector
          _arr = []
          for k,val of itm.valueOf()
            _arr.push _derive val
          return _arr
        itm
      for k,v of _object
        _o[k] = _derive v
      _o 
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
    _mdRef = {}
    unless @ instanceof _metaData 
      unless (arguments.length > 2) # and (_mdRef = arguments[2])? instanceof _metaData
        _mdRef = new _metaData @, {
          _path: ""
          _root: @
        }
      else
        _mdRef = arguments[2]
      @objectID = =>
        _mdRef.get '_id'
      @root = =>
        _mdRef.root() ? @
      @path = =>
        _mdRef.path()
      @parent = =>
        _mdRef.parent() ? @
 