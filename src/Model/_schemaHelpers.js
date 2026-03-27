/* ############################################################################
The MIT License (MIT)

Copyright (c) 2016 - 2019 Van Schroeder
Copyright (c) 2017-2019 Webfreshener, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

############################################################################ */
import {_mdRef, _oBuilders} from "./_references";
import {MetaData} from "./_metaData";
import {PropertiesModel} from "./propertiesModel";
import {ItemsModel} from "./itemsModel";

const isObjectLike = (value) => value && typeof value === "object";

const createChildPath = (ref, key) => (
    !Array.isArray(ref.model) ?
        `${ref.path}/properties/${key}` :
        `${ref.path}/items`
);

const createChildMeta = (ref, key, metaData) => {
    const childData = Object.assign({
        _path: createChildPath(ref, key),
        _parent: ref,
        _root: ref.root,
        _owner: ref.owner,
    }, metaData || {});
    return new MetaData(ref, childData);
};

const getChildModelCtor = (value) => (!Array.isArray(value) ? PropertiesModel : ItemsModel);

/**
 * @private
 */
export class SchemaHelpers {
    /**
     * @constructor
     */
    constructor(_ref) {
        if (!_ref || (typeof _ref) !== "object") {
            throw new Error("arguments[0] must be an object");
        }

        this._ref = _ref;
        Object.seal(this);
    }

    /**
     * Sets Object key/values upon PropertiesModel Reference
     * @param obj
     * @returns {*}
     */
    setObject(obj) {
        if (typeof obj === "string") {
            return obj;
        }
        this._setObjectEntries(obj);
        return this._ref;
    }

    /**
     * Creates Child Model and set data on it
     * @param key
     * @param value
     * @returns {*}
     */
    setChildObject(key, value) {
        const _mdData = _mdRef.get(this._ref);
        const _s = this.createSchemaChild(key, value, _mdData);
        // creates Observables for new Child Model
        _oBuilders.get(this._ref.owner).create(_s);

        if (typeof _s === "string") {
            return _s;
        } else if (!_s  || typeof _s !== "object") {
            return `'${key}' was invalid`;
        }

        _s.model = value;
        return _s.model;
    }

    _setObjectEntries(obj) {
        Object.keys(obj).forEach((k) => {
            const eMsg = this._ref.set(k, obj[k]);
            if (typeof eMsg === "string") {
                throw new Error(eMsg);
            }
        });
    }

    /**
     * Creates Child Model
     * @param {string} key
     * @param {*} value
     * @param {MetaData} metaData
     * @returns {BaseModel|string} - PropertiesModel, ItemsModel or error string
     */
    createSchemaChild(key, value, metaData) {
        if (!isObjectLike(value)) {
            return `'${key}' was invalid`;
        }

        const _md = createChildMeta(this._ref, key, metaData);
        const ChildModel = getChildModelCtor(value);
        return new ChildModel(_md);
    }
}
