import {_exists, _mdRef, _required_elements, _validators} from "./_references";
import {MetaData} from "./_metaData";
import {Schema} from "./schema";
import {Set} from "./set";

/**
 * @private
 */
export class SchemaHelpers {
    /**
     * @constructor
     */
    constructor(_ref) {
        if (!_exists(_ref) || (typeof _ref) !== "object") {
            throw new Error("arguments[0] must be an object");
        }

        this._ref = _ref;
        Object.seal(this);
    }

    /**
     * traverses schema node and builds list of required properties for reference
     * @param _signature
     */
    referenceRequiredElements(_signature) {
        // traverses properties of schema checking for properties marked as required
        if (_exists(_signature.properties)) {
            _signature = _signature.properties;
            for (let _sigEl of Object.keys(_signature)) {
                // -- tests for element `required`
                if (_signature[_sigEl].hasOwnProperty("required") &&
                    _signature[_sigEl].required === true) {
                    // -- adds required element to list
                    _required_elements.get(this._ref).splice(-1, 0, _sigEl);
                }
            }
            // freezes req'd properties object to prevent modification
            _required_elements.set(this._ref, Object.freeze(_required_elements.get(this._ref)));
        }
    }

    /**
     * Sets Object key/vals upon Schema Reference
     * @param obj
     * @returns {*}
     */
    setObject(obj) {
        if (typeof obj === "string") {
            return obj;
        }
        // calls set with nested key value pair
        Object.keys(obj).forEach((k) => {
            let eMsg = this._ref.set(k, obj[k]);
            if (typeof eMsg === "string") {
                throw new Error(eMsg);
            }
        });
        return this._ref;
    }

    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    setChildObject(key, value) {
        let _mdData = _mdRef.get(this._ref);
        let _s = this.createSchemaChild(key, value, this._ref.options || {}, _mdData);
        if (typeof _s === "string") {
            return _s;
        } else if (!_exists(_s) ||
            typeof _s !== "object") {
            return `'${key}' was invalid`;
        }
        _s.model = value;
        return _s.model;
    }

    /**
     * retrieves child element from Model signature
     * @param key - key for Model's Child element path
     * @returns {Object|Boolean}
     */
    getSchemaElement(key) {
        const _schemaRef = this._ref.schema;
        if (_schemaRef.hasOwnProperty(key)) {
            return _schemaRef[key];
        }

        if (_schemaRef.hasOwnProperty("properties")) {
            return _schemaRef.properties[key] || _schemaRef.properties;
        }

        return null;
    };

    /**
     *
     * @param key
     * @param value
     * @param opts
     * @param metaData
     * @returns {Schema|Set|string} - Schema, Set or error string
     */
    createSchemaChild(key, value, opts, metaData) {
        let _s; // will be set with Schema | Set
        let _d = Object.assign({
            _path: key,
            _root: this._ref.root,
            _jsd: this._ref.jsd,
        }, metaData || {});
        let _md = new MetaData(this._ref, _d);

        if (key.match(/.*\.+.*/) !== null) {
            key = key.split(".").pop();
        }

        // tests if value is not Array
        let _kS =  this.getSchemaElement(key);
        if (_kS.type !== "Array" && !Array.isArray(_kS) && !Array.isArray(value)) {
            let _schemaDef = (_kS.hasOwnProperty("properties") ? _kS.properties[key.split(".").pop()] : false) ||
                _kS["*"] || _kS;
            try {
                _s = new Schema(_schemaDef, opts, _md);
            } catch (e) {

                return e.message;
            }
        } else {
            try {
                let _sig = this._ref.signature[key].polymorphic || this._ref.signature[key];
                _s = new Set({"*": _sig}, opts, _md);
            } catch (e) {
                return e;
            }
        }
        return _s;
    }

    /**
     *
     * @param key
     * @param value
     * @return {boolean|string[]}
     */
    validate(key, value) {
        const _v = _validators.get(this._ref.jsd);
        if (!_v.validate(`${this._ref.validationPath}/`, value)) {
            return _v.errors;
        }

        return true;
    }
}
