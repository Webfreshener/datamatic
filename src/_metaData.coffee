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

    
    
    
    
# class _metaData extends Schema
  # constructor: (_oRef, _data)->
    # super {
      # elements:
        # _id:
          # type: "String"
          # required: true
          # restrict: "[a-z0-9_\$]{2,}"
        # _className:
          # type: "String"
          # required: true
          # restrict: "[a-z0-9_\$]{2,}"
        # _path:
          # type: "String"
          # required: true
          # restrict: "^[a-z0-9_\$\.]*$"
        # _root:
          # type: "Object"
          # required: true
        # _created:
          # type: "Number"
          # required: true
    # }
    # _cName = _global.wf.wfUtils.Fun.getConstructorName _oRef
    # @objectID = =>
      # @get '_id'
    # @root = =>
      # @get '_root'
    # @path = =>
      # @get '_path'
    # @parent = =>
      # return null unless (_root = @root())? instanceof Schema or _root instanceof Vector
      # _root.get @path.split('.').pop().join '.'
    # unless @_createID?
      # _id = 0
      # _metaData::_createID = ->
        # @__objID = "#{_cName}#{_id + 1}" unless @__objID?
        # @__objID
    # _d = Object.assign {}, _data, {
      # _id: @_createID()
      # _className: _cName
      # _created: Date.now()
    # }
    # # console.log "\n\n---------"
    # # console.log _d
    # # console.log "--------\n\n"
    # # @set _d
    # @set = (k,v)->
    # @set _d
       
