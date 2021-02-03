/* ############################################################################
The MIT License (MIT)

Copyright (c) 2019 Van Schroeder
Copyright (c) 2019 Webfreshener, LLC

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
const _validators = new WeakMap();
const _ajvRef = new WeakMap();
const _idRef = new WeakMap();
/**
 *
 * @param $ajv
 * @param schema
 * @param schemaId
 */
const addSchema = ($ajv, schema, schemaId) => {
    if (!schemaId) {
        schemaId = AjvWrapper.getSchemaID(schema);
    }

    // try {
        if (_idRef.get($ajv).indexOf(schemaId) === -1) {
            _idRef.get($ajv).splice(_idRef.get($ajv).length, 0, schemaId);

            $ajv.addSchema(schema, schemaId);
            return true
        }
    // } catch (e) {
    //    return
    // }
};

const addMetaSchema = ($ajv, schema) => {
    $ajv.addMetaSchema(schema);
};

/**
 * Wrapper for Ajv JSON-PropertiesModel Validator
 * @private
 */
export class AjvWrapper {
    /**
     * @constructor
     * @param schemas
     * @param ajvOptions
     */
    constructor(schemas, ajvOptions = {}) {
        if (_validators.get(this) === void (0)) {
            _validators.set(this, {});
        }

        // applies user specified options over our default Ajv Options
        const opts = Object.assign(_ajvOptions, ajvOptions);

        // makes user defined options object accessible for evaluation
        Object.defineProperty(this, "options", {
            get: () => opts,
            enumerable: true,
        });

        // declares default path of root# for validation queries
        this.path = "root#";

        // appends trailing "#" to end of "id" string if missing
        const _procID = (id) => id.match(/#+$/) === null ? `${id}#` : id;

        // processes schema "id" for JSON-schemas =< v04 and >= v06
        const _procSchema = (_s) => {
            const _key = ["$id","id"].find((k) => _s.hasOwnProperty(`${k}`));
            if (_key) {
                _s[_key] = _procID(_s[_key]);
            }
            return _s;
        };

        // evaluates contents of schemas to normalize "id" attributes to have trailing "#"
        if ((typeof schemas) === "object") {
            if (schemas.hasOwnProperty("schemas")) {
                if (Array.isArray(schemas.schemas)) {
                    schemas.schemas = schemas.schemas.map(_procSchema);
                } else {
                    schemas.schemas = _procSchema(schemas.schemas);

                }
            } else {
                if (Array.isArray(schemas)) {
                    schemas = schemas.map(_procSchema);
                } else {
                    schemas = _procSchema(schemas);
                }
            }
        }

        // initializes Ajv instance for this Doc and stores it to WeakMap
        _ajvRef.set(this, createAJV(schemas, opts));

        // accept no further modifications to this object
        Object.seal(this);
    }

    /**
     * Getter for captive Ajv validator
     * -- use this for Ajv API Methods
     * @returns {ajv}
     */
    get $ajv() {
        return _ajvRef.get(this);
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

        let _res = false;

        try {
            _res = this.$ajv.validate(path, value);
            if (this.$ajv.errors) {
                return false; //JSON.stringify(this.$ajv.errors);
            }
        } catch (e) {
            return e.toString();
        }


        return _res;
    }

    /**
     *
     * @param schema
     * @param schemaId
     */
    addSchema(schema, schemaId=false) {
        addSchema(this, schema, schemaId);
        return this;
    }

    /**
     * retrieves ID attribute from schema
     * @param schema
     * @returns {string}
     */
    static getSchemaID(schema) {
        const id = ["$id", "id"].filter((id) => schema.hasOwnProperty(id));
        return id.length ? schema[id[0]] : "root#";
    }
}

/**
 *
 * @param $ajv
 * @param _s
 * @private
 */
const _metaTest = ($ajv, _s) => {
    if (_s.hasOwnProperty("meta")) {
        if (Array.isArray(_s.meta)) {
            _s.meta.forEach((meta) => {
                addMetaSchema($ajv, meta);
            });
        }
    }
};

/**
 *
 * @param schemas
 * @param opts
 * @returns {ajv | ajv.Ajv}
 */
const createAJV = (schemas, opts) => {
    const _ajv = new Ajv(opts);
    _idRef.set(_ajv, []);
    if (schemas) {
        _metaTest(_ajv, schemas);
        // todo: review performance of addSchema
        schemas = schemas["schemas"] ? schemas.schemas : schemas;
        if (Array.isArray(schemas)) {
            schemas.forEach((schema) => {
                // _metaTest(_ajv, schema);
                addSchema(_ajv, schema);
            });
        } else {
            if ((typeof schemas).match(/^(object|boolean)$/)) {
                _metaTest(_ajv, schemas);
                addSchema(_ajv, schemas);
            }
        }
    }

    return _ajv;
};

/**
 * AJV Options Config in it's entirely for reference
 * only TxPipe specific option changes are enabled
 * @type {*}
 * @private
 */
const _ajvOptions = {
    // // validation and reporting options:
    // $data:            false,
    // allErrors:        true,
    allowUnionTypes:     true,
    // verbose:          true,
    // $comment:         false, // NEW in Ajv version 6.0
    // uniqueItems:      true,
    // unicode:          true,
    // format:           'fast',
    // formats:          {},
    // unknownFormats:   true,
    // schemas:          {},
    // logger:           undefined,
    // // referenced schema options:
    // schemaId: 'auto',
    // missingRefs:      true,
    // loadSchema:       undefined, // function(uri: string): Promise {}
    // // options to modify validated data:
    removeAdditional: false,
    // useDefaults: true,
    // coerceTypes:      false,
    // // asynchronous validation options:
    // transpile:        undefined, // requires ajv-async package
    // // advanced options:
    // meta:             true,
    // validateSchema:   true,
    // addUsedSchema:    true,
    // inlineRefs:       true,
    // passContext:      false,
    // loopRequired:     Infinity,
    // ownProperties:    false,
    // multipleOfPrecision: false,
    // errorDataPath:    'object', // deprecated
    // messages:         true,
    // sourceCode:       false,
    // processCode:      undefined, // function (str: string): string {}
    // cache:            new Cache,
    // serialize:        undefined
};
