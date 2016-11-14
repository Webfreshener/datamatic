class _metaData
  constructor:  (_oRef, _data)->
    _cName = _global.wf.wfUtils.Fun.getConstructorName _oRef
    unless @_createID?
      _id = 0
      _metaData::_createID = ->
        @__objID = "#{_cName}#{_id + 1}" unless @__objID?
        @__objID
    Object.assign _data, {
      _id: @_createID()
      _className: _cName
      _created: Date.now()
    }
    @get = (key) =>
      _data[key] ? null
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
