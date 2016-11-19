/**
 * @private
 */
class _metaData {
  /**
   * @constructor
   * @param {Schema|Vector} _oRef
   * @param {object} _data
   */
  constructor(_oRef, _data){
    let _cName = _global.wf.wfUtils.Fun.getConstructorName(_oRef);
    if (this._createID == null) {
      let _id = 0;
      _metaData.prototype._createID = function() {
        if (this.__objID == null) { 
        	this.__objID = `${_cName}${_id + 1}`; }
        return this.__objID;
      };
    }
    Object.assign(_data, {
      _id: this._createID(),
      _className: _cName,
      _created: Date.now()
    });
    console.log(`_data: ${JSON.stringify(_data, null, 2)}`)
    /**
     * @param {string} key
     */
    this.get = key => {
      return _data.hasOwnProperty(key) ? _data[key] : null; };
    /**
     * not implemented
     */
    this.set = ()=> {
      return "not implemented"; };
    /**
     * @returns {string} Unique ObjectID
     */
    this.objectID = () => {
      return this.get('_id'); };
    /**
     * @returns {Schema|Vector} root Schema Element
     */
    this.root = () => {
     return this.get('_root'); };
    /**
	 * @returns {string} path to Element
     */
    this.path = () => {
      return this.get('_path'); };
    /**
  	 * @returns {string} path to Element
     */
    this.parent = () => {
      var _p = this.path().split('.');
      _p =  (_p.length > 1) ? _p.slice(0, _p.length - 2).join('.') : _p[0];
      return (_p.length > 0) ? this.root().get( _p ) : this; }
  }
}
