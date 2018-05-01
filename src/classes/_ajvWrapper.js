/**
 * @private
 */
import {_ajvRef} from "./_references";
import {default as JSONSchemaV4} from "../schemas/json-schema-draft-04";
import {default as JSONSchemaV6} from "../schemas/json-schema-draft-06";
import {RxVO} from "./rxvo";
import Ajv from "ajv";

/**
 * Wrapper for Ajv JSON-PropertiesModel Validator
 * @private
 */
export class AjvWrapper {
    /**
     * @constructor
     * @param rxvo
     * @param schema
     * @param ajvOptions
     */
    constructor(rxvo, schemas, ajvOptions = {}) {
        // ensures that we are given something that represents a RxVO object
        if ((!rxvo) || !(rxvo instanceof RxVO)) {
            throw "RxVO is required at arguments[0]";
        }

        // defines getter for parent RxVO reference
        Object.defineProperty(this, "$rxvo", {
            get: () => rxvo,
            enumerable: false,
        });

        // applies user specified options over our default Ajv Options
        const opts = Object.assign(_ajvOptions, ajvOptions);
        console.log(opts);
        // makes user defined options object accessible for evaluation
        Object.defineProperty(this, "options", {
           get: () => opts,
           enumerable: true,
        });

        const _ajv = new Ajv(opts);
        if (schemas && schemas !== null) {
            if (schemas.hasOwnProperty("meta")) {
                if (Array.isArray(schemas.meta)) {
                    schemas.meta.forEach((meta) => {
                        _ajv.addMetaSchema(JSONSchemaV4);
                    });
                }
            }

            if (schemas.hasOwnProperty("schema")) {
                if (Array.isArray(schemas.schema)) {
                    schemas.schema.forEach((schema) => {
                        _ajv.addSchema(schema);
                    });
                } else {
                    if ((typeof schemas.schema) === "string") {
                        _ajv.addSchema(schemas.schema);
                    }
                }
            }

            if (schemas.hasOwnProperty("use")) {
                this.use = schemas.use
            } else {
                this.use = "root"
            }
        }

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
     * @param path
     * @param value
     */
    exec(path, value) {
        return this.$ajv.validate(path, value);
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
    jsonPointers:     true,
    // uniqueItems:      true,
    // unicode:          true,
    // format:           'fast',
    // formats:          {},
    // unknownFormats:   true,
    // schemas:          {},
    // logger:           undefined,
    // referenced schema options:
    schemaId:         'auto',
    // missingRefs:      true,
    // extendRefs:       'fail', // default 'ignore'
    // loadSchema:       undefined, // function(uri: string): Promise {}
    // options to modify validated data:
    removeAdditional: true,
    useDefaults:      true,
    // coerceTypes:      false,
    // asynchronous validation options:
    // transpile:        undefined, // requires ajv-async package
    // advanced options:
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
