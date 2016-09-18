class ValidatorBuilder
  constructor:->
    _validators = {}
    ## _buildValidator
    # accepts: _ref:Object, _path:String
    _buildValidator = (_ref, _path)=>
      _v = [_ref]
      if Array.isArray _ref
        _v = _ref.map (_s) => _buildValidator _s, _path
      _validators[_path] = (value)=>
        for vItm in _v
          return "'#{_path}' is reuqired" if vItm.required and !(value?)
          switch typeof value
            when 'string'
              _x = vItm.type ? null if typeof vItm is 'object'
              _x ?= vItm
              return "#{_path} requires #{_x} type was 'String'" unless vItm is 'String' or _x.match /^string$/i
              if vItm.restrict?
                return "value '#{value}' for #{_path} did not match required expression" unless ((new RegExp vItm.restrict).exec value)?
              return true
            when 'function'
              _x = if typeof vItm is 'string' then vItm else _global.wfUtils.Fun.getConstructorName vItm
              return _x == _global.wfUtils.Fun.getConstructorName value
            when 'object'
              return false unless value.validate?()
            when 'number'
              _x = if vItm.type? and typeof vItm.type is 'string' then _schemaroller_.getClass vItm.type else vItm.type
              _x ?= vItm
              return true if _x is 'Number'
              return "'#{_path}' expected #{fName}, type was '<Number>'" unless (fName = _global.wfUtils.Fun.getFunctionName _x) == 'Number'
              return !isNaN new _x value
            else
              _x = if typeof vItm.type is 'string' then _schemaroller_.getClass vItm.type else vItm.type
              return (_x? and value instanceof _x)
        # should not be here
        false
    @list = ->
      Object.keys _validators
    @get = (path)->
      _validators[path] ? null
    @set = (_path, func)->
      return "2nd argument expects a function" unless func? and typeof func is 'function'
      _validators[path] = func
    @create = (_ref, _path)->
      _buildValidator.apply @, arguments
    @exec = (_path, value)->
      _validators[_path]? value ? "validator for '#{_path}' does not exist"
  @getInstance: ->
    @__instance ?= new @
