/**
 * @private
 */
import {_ajvRef} from "./_references";
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
    constructor(rxvo, schema, ajvOptions = {}) {
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

        // makes user defined options object accessible for evaluation
        Object.defineProperty(this, "options", {
           get: () => opts,
           enumerable: true,
        });

        const _ajv = new Ajv(opts);
        // initializes Ajv instance for this Doc and stores it to WeakMap
        _ajvRef.set(this, _ajv);

        // tests for schema and sets provided schema as the "root" schema
        if (schema !== void(0)) {
            _ajv.addSchema(schema, "root");
        }

        // accept no further modifications to this object
        Object.seal(this);
    }

    /**
     * helper method to derive path for given model
     * todo: review for removal
     * @param model
     * @return {string}
     */
    static resolvePath(model) {
        return "not yet implemented";
    }

    /**
     * getter for captive Ajv validator
     * -- use this for Ajv API Methods
     * @returns {ajv}
     */
    get $ajv() {
        return _ajvRef.get(this);
    }

    /**
     * Executes validator at PropertiesModel $ref `path` against `value`
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
    $data:            true,
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
    // schemaId:         '$id',
    // missingRefs:      true,
    // extendRefs:       'fail', // default 'ignore'
    // loadSchema:       undefined, // function(uri: string): Promise {}
    // options to modify validated data:
    // removeAdditional: false,
    // useDefaults:      true,
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
