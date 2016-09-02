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
            type: _schema[_oKey].ucfirst(), 
            required: false
          }
          _o = Object.assign _schema, obj
          _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey]
        when "object"
          unless Array.isArray _schema[_oKey]
            _errorMsg = @validateSchemaEntry _oKey, _schema[_oKey]
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
  validateTypeString: (key, _type)->
    if key.match /\.restrict+$/
      return 'restrict requires a Regular Expression String' unless typeof _type is 'string'
      try "text".match new RegExp _type
      catch e
        return "Regular Expression provided for '#{key}' was invalid" unless _type.match rx
    else if (SchemaRoller.getClass _type.ucfirst())? is false
      return "type '<#{_type}>' for schema element '#{key}' was invalid"
    true
  validateSchemaEntry: (key, params, opts)->
    opts ?= @opts
    _schemaKeys = SchemaRoller.getSchemaRef()
    return "#{key} was null or undefined" unless params?
    return @validateTypeString "#{key}.#{sKey}", params if typeof params == 'string'
    if typeof params == 'object'
      unless params.hasOwnProperty "type"
        if (_p = (keyPath = key.split '.').pop()) != 'elements' 
          unless _p is 'default'
            return "value for schema element '#{key}' was malformed. Property 'type' was missing"
        else
          for param in Object.keys params
            @validateSchemaEntry "#{keyPath.join '.'}.#{param}", params[param]
            return
      unless (SchemaRoller.getClass params.type)?
        return true if Object.keys(params).length == 0
        return @validateSchemaEntry key, params.type if typeof params.type is 'object'
        return "value for schema element '#{key}' has invalid type '<#{params.type}>'"
      for sKey in Object.keys params
        return "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
        if typeof params[sKey] == "string"
          _kind = params[sKey].ucfirst()
          return "schema element '#{key}.#{sKey}' is not allowed" unless _schemaKeys[sKey]? or opts.extensible
          return eMsg if typeof (eMsg = @validateTypeString "#{key}.#{sKey}", params[sKey]) is 'string'
        if typeof _schemaKeys[sKey] == 'object'
          _type = _schemaKeys[sKey].type
          unless Array.isArray _type
            return "invalid schema element '#{key}' requires type '#{_type}' type was '<#{_kind}>'" unless _type == _kind
        else
          if Array.isArray params[sKey]
            for _k in params[sKey]
              return eMsg if typeof (eMsg = @validateSchemaEntry "#{key}.#{sKey}", _k) is 'string'
          else
            unless sKey == 'elements'
              return eMsg if typeof (eMsg = @validateSchemaEntry "#{key}.#{sKey}",  params[sKey]) is 'string'
            else
              for xKey in params[sKey]
                return eMsg if typeof (eMsg = @validateSchemaEntry "#{key}.#{xKey}",  params[sKey][xKey]) is 'string'
            return eMsg if typeof (eMsg = @validateSchemaEntry "#{key}.#{sKey}", params[sKey]) is 'string'
            return true
      return true
    else
      _t = typeof params
      unless _t == 'function'
        # tests for everything that's not a string, _object or function
        return "value for schema element '#{key}' has invalid type '<#{_t}>'" unless _schemaKeys[key.split('.').pop()] == _t.ucfirst()
      else
        # tests for function's constructor name
        return "value for schema element '#{key}' has invalid class or method '<#{_fn}>'" unless (_fn = Fun.getConstructorName params) == _schemaKeys[key]
      return true
    # should not have gotten here -- so flag it as error
    "unable to process schema element '#{key}'"
module.exports = SchemaValidator
{SchemaRoller} =  require './schemaroller'
# _allowed_keys = Object.keys _o
_sKeys = Object.keys SchemaRoller.getSchemaRef()
rx = new RegExp "^((#{_sKeys.join '|'})+,?){#{_sKeys.length}}$"
