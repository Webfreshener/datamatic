/**
 * @private
 */
import {_ajvRef} from "./_references";
import {RxVO} from "./rxvo";
import Ajv from "ajv";

const _validators = new WeakMap();

/**
 * retrieves ID attribute from schema
 * @param schema
 * @returns {string}
 */
const getSchemaID = (schema) => {
    const id = ["$id", "id"].filter((id) => schema.hasOwnProperty(id));
    return id.length ? schema[id[0]] : "root#";
};

/**
 * backreferences object tree for top-down evaluation
 * @param path
 * @param data
 * @param rxvo
 * @returns {any}
 * @private
 */
const _preconstruct = (path, data, rxvo) => {
    const _p = path.replace(/^[a-z0-9_]*#+/i, "").split("/");
    let _o = Object.assign({}, data);

    while(_p.length > 0) {
        _p.pop();
        _o = Object.assign({}, rxvo.getPath(_p.join(".")), _o);
    }

    return _o;
};

/**
 *
 * @param inst
 * @param schemas
 * @param opts
 * @returns {ajv | ajv.Ajv}
 */
const createAjv = (inst, schemas, opts) => {
    const _ajv = new Ajv(opts);
    if (schemas) {
        if (schemas.hasOwnProperty("meta")) {
            if (Array.isArray(schemas.meta)) {
                schemas.meta.forEach((meta) => {
                    _ajv.addMetaSchema(meta);
                });
            }
        }

        // todo: review performance of addSchema
        if (schemas.hasOwnProperty("schemas")) {
            let schemaID;
            if (Array.isArray(schemas.schemas)) {
                schemas.schemas.forEach((schema) => {
                    schemaID = getSchemaID(schema);
                    _ajv.addSchema(schema, schemaID);
                });
            } else {
                if ((typeof schemas.schemas) === "string") {
                    schemaID = getSchemaID(schemas.schema);
                    _ajv.addSchema(schemas.schemas, schemaID);
                }
            }

            if (schemaID) {
                inst.path = schemaID;
            }
        }
    }

    return _ajv;
};

/**
 * Wrapper for Ajv JSON-PropertiesModel Validator
 * @private
 */
export class AjvWrapper {
    /**
     * @constructor
     * @param rxvo
     * @param schemas
     * @param ajvOptions
     */
    constructor(rxvo, schemas, ajvOptions = {}) {
        // ensures that we are given something that represents a RxVO object
        if ((!rxvo) || !(rxvo instanceof RxVO)) {
            throw "RxVO is required at arguments[0]";
        }

        if (_validators.get(this) === void(0)) {
            _validators.set(this, {});
        }

        // defines getter for parent RxVO reference
        Object.defineProperty(this, "$rxvo", {
            get: () => rxvo,
            enumerable: false,
        });

        // applies user specified options over our default Ajv Options
        const opts = Object.assign(_ajvOptions, ajvOptions);

        // makes user defined options object accessible for evaluation
        Object.defineProperty(this, "options", {
            get: () => opts,
            enumerable: true,
        });

        // decalres default path of root# for validation queries
        this.path = "root#";

        // appends trailing "#" to end of "id" string if missing
        const _procID = (id) => id.match(/#+$/) === null ? `${id}#` : id;

        // processes schema "id" for JSON-schemas =< v04 and >= v06
        const _procSchema = (_s) => {
            if (_s.hasOwnProperty("$id")) {
                _s["$id"] = _procID(_s["$id"]);
            }

            if (_s.hasOwnProperty("id")) {
                _s["id"] = _procID(_s["id"]);
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

        const _ajv = createAjv(this, schemas, opts);

        // initializes Ajv instance for this Doc and stores it to WeakMap
        _ajvRef.set(this, _ajv);

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

        /*
            makes initial validation attempt and reattempts from top on failure
         */
        try {
            _res = this.$ajv.validate(path, value);
        } catch (e) {
            if (path.replace(/(items|properties)\/?/, "").split("/").length) {
                return this.exec(`${this.path}/`, _preconstruct(path, value, this.$rxvo));
            }
        }

        return _res;
    }
}

/**
 * AJV Options Config in it's entirely for reference
 * only RxVO specific option changes are enabled
 * @type {*}
 * @private
 */
const _ajvOptions = {
    // // validation and reporting options:
    // $data:            false,
    // allErrors:        true,
    // verbose:          true,
    // $comment:         false, // NEW in Ajv version 6.0
    jsonPointers: true,
    // uniqueItems:      true,
    // unicode:          true,
    // format:           'fast',
    // formats:          {},
    // unknownFormats:   true,
    // schemas:          {},
    // logger:           undefined,
    // // referenced schema options:
    schemaId: 'auto',
    // missingRefs:      true,
    extendRefs: true, // default 'ignore'
    // loadSchema:       undefined, // function(uri: string): Promise {}
    // // options to modify validated data:
    // removeAdditional: true,
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
