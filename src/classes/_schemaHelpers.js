import {_exists, _mdRef, _required_elements, _vBuilders} from "./_references";
import {ensureRequiredFields} from "./utils";
import {MetaData} from "./_metaData";
import {Schema} from "./schema";
import {Set} from "./set";
import {JSD} from "./jsd";

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
     * traverses schema node and builds list of required elements for reference
     * @param _signature
     */
    referenceRequiredElements(_signature) {
        // traverses elements of schema checking for elements marked as required
        if (_exists(_signature.elements)) {
            _signature = _signature.elements;
            for (let _sigEl of Object.keys(_signature)) {
                // -- tests for element `required`
                if (_signature[_sigEl].hasOwnProperty("required") &&
                    _signature[_sigEl].required === true) {
                    // -- adds required element to list
                    _required_elements.get(this).splice(-1, 0, _sigEl);
                }
            }
            // freezes req'd elements object to prevent modification
            _required_elements.set(this._ref, Object.freeze(_required_elements.get(this._ref)));
        }
    }

    /**
     * Sets Object key/vals upon Schema Reference
     * @param obj
     * @returns {*}
     */
    setObject(obj) {
        obj = ensureRequiredFields(this._ref, obj);
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
     * @param key {string) key for Model's Child element
     * @returns {Object|Boolean}
     */
    getSchemaElement(key) {
        const _schemaRef = this._ref.schema;
        if (key === "polymorphic") {
            return _schemaRef.polymorphic[0];// {"*": {type: "Array", polymorphic: _schemaRef.polymorphic}};
        }
        if (_schemaRef.hasOwnProperty(key)) {
            return _schemaRef[key];
        }

        if (_schemaRef.hasOwnProperty("elements")) {
            return _schemaRef.elements[key] || _schemaRef.elements;
        }

        if (_schemaRef.hasOwnProperty("polymorphic")) {
            return { type: "Array", polymorphic: _schemaRef.polymorphic}; // _schemaRef.polymorphic[key] || _schemaRef.polymorphic;
        }

        return this._ref.options.extensible ? JSD.defaults : false;
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
        // tests for nested sub-elements with partial paths as keys
        if (key.match(/\.?polymorphic\.\d$/) !== null) {
                key = "polymorphic";
        }
        else if (key.match(/.*\.+.*/) !== null) {
            key = key.split(".").pop();
        }
        // tests if value is not Array
        let _kS =  this.getSchemaElement(key);
        if (_kS.type !== "Array" && !Array.isArray(_kS) && !Array.isArray(value)) {
            let _schemaDef = (_kS.hasOwnProperty("elements") ? _kS.elements[key.split(".").pop()] : false) ||
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
     * @returns {*}
     */
    validate(key, value) {
        const _vBuilder = this._ref.validatorBuilder;
        let msg = `unable to resolve path for "${key}"`;
        let _list = `${JSON.stringify(_vBuilders.get(this._ref.jsd).list())}`;
        _vBuilder.resolvePath(this._ref.validationPath, key)
            .some((path) => {
                msg = this._ref.validatorBuilder.exec(path, value);
                return (msg);
            });
        return msg;
    }
}
