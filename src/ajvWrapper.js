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
/**
 * @private
 */
import Ajv from "ajv";
import {default as ajvOptions} from "./ajv-options";
import {Model} from "./Model";
import addFormats from "ajv-formats";

const _validators = new WeakMap();

/**
 * backreferences object tree for top-down evaluation
 * @param path
 * @param data
 * @param owner
 * @returns {any}
 * @private
 */
const _preconstruct = (path, data, owner) => {
    const _p = path.replace(/^[a-z0-9_]*#+/i, "").split("/");
    let _o = Object.assign({}, data);
    while (_p.length > 0) {
        _p.pop();
        try {
            _o = Object.assign({}, owner.getPath(_p.join(".")), _o);
        } catch (e) {
            _p.splice(0, _p.length - 1);
            throw e;
        }
    }

    return _o;
};

let $ajv;

/**
 *
 * @param opts
 */
const ajvInit = (opts) => {
    if ($ajv) {
        return $ajv;
    }

    addFormats($ajv = new Ajv(opts));
}


class SchemaUtils {
    /**
     * Processes schema "id" for JSON-Schema versions =< v04 and >= v06
     *
     * @param schema
     * @return {boolean|string|*}
     */
    static getSchemaID(schema) {
        const _id = schema["$id"] || schema["id"];

        if (!_id) {
            return false;
        }

        // ensures trailing "#" to end of "id" string
        return _id.match(/#+$/) === null ? `${_id}#` : _id;
    }

    /**
     * • Evaluates contents of schemas to normalize "id" attributes
     * • Ensures schemas value is array
     *
     * @param schemas
     * @return {*}
     */
    static normalizeSchemas(schemas) {
        if ((schemas.hasOwnProperty("schemas"))) {
            schemas = schemas.schemas;
        }

        const assignSchemaId = (__) => {
            return Object.assign(__, {id: SchemaUtils.getSchemaID});
        };

        return Array.isArray(schemas) ?
            schemas.map(assignSchemaId) : [
                assignSchemaId(
                    (typeof schemas) === "string" ?
                        JSON.parse(schemas) : schemas
                )
            ];
    }

    /**
     *
     * @param schemas
     * @return {*}
     */
    static addSchemas(schemas = {}) {
        if (schemas.hasOwnProperty("meta")) {
            schemas.meta.forEach($ajv.addMetaSchema);
        }

        schemas.schemas.forEach((schema) => {
            $ajv.addSchema(schema, schema.id);
        });
    }
}

/**
 * Wrapper for Ajv JSON-PropertiesModel Validator
 * @private
 */
export class AjvWrapper {
    /**
     * @constructor
     * @param owner
     * @param schemas
     * @param ajvOptions
     */
    constructor(owner, schemas, options = {}) {
        // ensures that we are given something that represents a Model object
        if ((!owner) || !(owner instanceof Model)) {
            throw "Model is required at arguments[0]";
        }

        if (_validators.get(this) === void (0)) {
            _validators.set(this, {});
        }

        // defines getter for parent Model reference
        Object.defineProperty(this, "$owner", {
            get: () => owner,
            enumerable: false,
        });

        // applies user specified ajv options and makes accessible for evaluation
        Object.defineProperty(this, "options", {
            value: Object.assign(ajvOptions, options),
            enumerable: true,
            configurable: false,
            writable: false,
        });

        ajvInit(this.options);

        // declares default path of root# for validation queries
        this.path = "root#";

        const _schemas = SchemaUtils.normalizeSchemas(schemas);

        // const _ajv = createAjv(this, schemas, opts);
        if (!_vDict.hasOwnProperty(path)) {
            _vDict[path] = this.$ajv.getSchema(path);
            console.log(`_vDict["${path}"]: ${JSON.stringify(this.$ajv.getSchema(path), null, 2)}`);
        }

        // accept no further modifications to this object
        Object.seal(this);
    }

    /**
     * Helper method to derive path for given model
     * todo: review for removal
     * @param model
     * @return {string}
     */
    static resolvePath(model) {
        return "not yet implemented";
    }

    // /**
    //  * Getter for captive Ajv validator
    //  * -- use this for Ajv API Methods
    //  * @returns {ajv}
    //  */
    // get $ajv() {
    //     return _ajvRef.get(this);
    // }

    get errors() {
        return $ajv.errors;
    }

    /**
     * Executes validator at PropertiesModel $model `path` against `value`
     * @param {string} path
     * @param {any} value
     */
    exec(path, value) {
        // appends id ref to path
        if (path.indexOf("#") < 0) {
            path = `${this.path}${path}`;
        }

        const _vDict = _validators.get(this);
        let _res = false;

        /*
            makes initial validation attempt and re-attempts from top on failure
         */
        try {
            _res = _vDict[path](value);
        } catch (e) {

            if (path.replace(/(items|properties)\/?/, "").split("/").length) {
                return this.exec(`${this.path}/`, _preconstruct(path, value, this.$owner));
            }

            throw(e);
        }

        return _res;
    }
}
