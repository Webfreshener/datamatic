class _metaData extends Schema
  constructor: (_oRef, _data)->
    super {
      elements:
        _id:
          type: "String"
          required: true
          restrict: "[a-z0-9_\$]{2,}"
        _className:
          type: "String"
          required: true
          restrict: "[a-z0-9_\$]{2,}"
        _path:
          type: "String"
          required: true
          restrict: "^[a-z0-9_\$\.]*$"
        _root:
          type: "Object"
          required: true
        _created:
          type: "Number"
          required: true
    }
    _cName = _global.wf.wfUtils.Fun.getConstructorName _oRef
    @set _data
    @objectID = =>
      @get '_id'
    @set = ()=>
      return "not implemented"    
    @objectID = =>
      @get '_id'
    @root = =>
     @get '_root'
    @path = =>
      @get '_path'
    @parent = =>
      _p = if (_p = @path().split '.').length > 1 then _p.slice(0, _p.length - 2).join '.' else _p[0]
      if _p.length > 0 then @root().get( _p ) else @
