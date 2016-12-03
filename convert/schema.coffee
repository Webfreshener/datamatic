class Convert
    #### @set(key, value)
    #> sets key/value to virtualized _object
    set: (key, value)->
      if typeof key is 'object'
        return _f if typeof (_f = _hasRequiredFields Object.assign {}, _object, key) is 'string'
        # calls set with nested key value pair
        for k,v of key
          eMsg = @set k, v
          return eMsg if typeof eMsg  is 'string'
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
          let _o = _object.get(this);
          _o[key] = value;
          _object.set(this, _o);
      # returns self for chaining
      @
