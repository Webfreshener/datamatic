class SchemaValidator
  constructor:(_schema = {}, @opts={extensible:false})->
    _errorMsg = null
    @isValid = ->
      _errorMsg || true
    # validates SCHEMA ENTRIES
    for _oKey in Object.keys _schema
      switch typeof _schema[_oKey]
        when "string"
          obj = {}
          obj[_oKey] = {
            type: _global.wf.wfUtils.Str.capitalize _schema[_oKey], 
            required: false
          }
          _o = Object.assign _schema, obj
          _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey]
        when "object"
          unless Array.isArray _schema[_oKey]
            unless _oKey == 'elements'
              _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey]
            else
              for xKey in Object.keys _schema[_oKey]
                return _errorMsg if typeof (_errorMsg = @validateSchemaEntry xKey, _schema[_oKey][xKey]) is 'string'
          else
            for _s in _schema[_oKey]
              if typeof _schema[_oKey][_s] is 'string'
                _errorMsg = @validateTypeString _oKey, _schema[_oKey][_s]
              else
                _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey][_s]
        when "boolean"
          _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey]
        else
          _errorMsg = "value for schema element '#{_oKey}' was invalid"
    _errorMsg   
  validateTypeString: (key, _type)->
    return true if key.match /\.?default+$/
    if key.match /\.restrict+$/
      return 'restrict requires a Regular Expression String' unless typeof _type is 'string'
      try "text".match new RegExp _type
      catch e
        return "Regular Expression provided for '#{key}' was invalid" unless _type.match _schemaroller_.rx
    else if (_schemaroller_.getClass _global.wf.wfUtils.Str.capitalize _type)? is false
      return "type '<#{_type}>' for schema element '#{key}' was invalid"
    true
  validateSchemaEntry: (key, params, opts)->
    opts ?= @opts
    _schemaKeys = _schemaroller_.getSchemaRef()
    return "#{key} was null or undefined" unless params?
    return true if typeof params == 'boolean'
    return @validateTypeString "#{key}", params if typeof params == 'string'
    if typeof params == 'object'
      unless params.hasOwnProperty "type"
        if Array.isArray params
          for item in params
            return _res if typeof (_res = @validateSchemaEntry key, item) is 'string'
        else
          unless (_p = (keyPath = key.split '.').pop()) == 'elements' 
            return true if _p is 'default'
            return "value for schema element '#{key}' was malformed. Property 'type' was missing"
          else
            for param in Object.keys params
              _keys = [].concat( keyPath ).concat param
              return _res if typeof (_res = @validateSchemaEntry "#{_keys.join '.'}", params[param]) is 'string'
        return true
      unless (_schemaroller_.getClass params.type)?
        return true if params.type is '*'
        return true if Object.keys(params).length == 0
        return @validateSchemaEntry key, params.type if typeof params.type is 'object'
        if key.split('.').pop() == 'default'
          @_defaults ?= {}
          @_defaults[key] = params
          return true
        return "value for schema element '#{key}' has invalid type '<#{params.type}>'"
      for sKey in Object.keys params
        return "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
        if typeof params[sKey] == "string"
          _kind = _global.wf.wfUtils.Str.capitalize params[sKey]
          if sKey == 'restrict'
            try
              new RegExp params[sKey]
            catch e
              return e
            return true
          return "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
          return eMsg if typeof (eMsg = @validateTypeString "#{key}.#{sKey}", params[sKey]) is 'string'
        if typeof _schemaKeys[sKey] == 'object'
          if sKey == "elements"
            for xKey in Object.keys params.elements
              return eMsg if typeof (eMsg = @validateSchemaEntry "#{key}.#{xKey}", params.elements[xKey]) is 'string'
            return true
          else
            return "type attribute was not defined for #{key}" unless (_type = _schemaKeys[sKey]?.type)?
            _type = _type.type unless Array.isArray _type
      return true
    else
      _t = typeof params
      unless _t == 'function'
        # tests for everything that's not a string, _object or function
        return "value for schema element '#{key}' has invalid type '<#{_t}>'" unless _schemaKeys[key.split('.').pop()] == _global.wf.wfUtils.Str.capitalize _t
      else
        # tests for function's constructor name
        return "value for schema element '#{key}' has invalid class or method '<#{_fn}>'" unless (_fn = _global.wf.wfUtils.Fun.getConstructorName params) == _schemaKeys[key]
      return true
    # should not have gotten here -- so flag it as error
    "unable to process schema element '#{key}'"
