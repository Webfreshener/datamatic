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
import {default as ajvOptions} from "../ajv-options";
import {Model} from "./index";
import addFormats from "ajv-formats";
import {getSchemaID} from "./utils";
import {_ajvRef} from "./_references";

const _validators = new WeakMap();
const DRAFT_04_META_ID = "http://json-schema.org/draft-04/schema#";
const DRAFT_04_META_ID_NOHASH = "http://json-schema.org/draft-04/schema";
const DRAFT_07_META_ID = "http://json-schema.org/draft-07/schema";
const DRAFT_07_META_ID_HASH = "http://json-schema.org/draft-07/schema#";
let _ajvDraft04 = null;

const loadAjvDraft04 = () => {
    if (_ajvDraft04 !== null) {
        return _ajvDraft04 || null;
    }
    try {
        // Lazy-load to avoid hard dependency for non-draft-04 users.
        // eslint-disable-next-line global-require
        const mod = require("ajv-draft-04");
        _ajvDraft04 = mod && mod.default ? mod.default : mod;
    } catch (e) {
        _ajvDraft04 = false;
    }
    return _ajvDraft04 || null;
};

const isDraft04Meta = (meta) => {
    if (!meta || typeof meta !== "object") {
        return false;
    }
    return meta.$id === DRAFT_04_META_ID
        || meta.id === DRAFT_04_META_ID
        || meta.$id === DRAFT_04_META_ID_NOHASH
        || meta.id === DRAFT_04_META_ID_NOHASH;
};

const isDraft04Schema = (schema) => {
    if (!schema || typeof schema !== "object") {
        return false;
    }
    return schema.$schema === DRAFT_04_META_ID || schema.$schema === DRAFT_04_META_ID_NOHASH;
};

const isDraft07Schema = (schema) => {
    if (!schema || typeof schema !== "object") {
        return false;
    }
    return schema.$schema === DRAFT_07_META_ID || schema.$schema === DRAFT_07_META_ID_HASH;
};

const usesDraft07 = (schemas) => {
    if (!schemas || typeof schemas !== "object") {
        return false;
    }
    const list = schemas.schemas ? schemas.schemas : schemas;
    const arr = Array.isArray(list) ? list : [list];
    return arr.some(isDraft07Schema);
};

const usesDraft04 = (schemas) => {
    if (!schemas || typeof schemas !== "object") {
        return false;
    }
    const list = schemas.schemas ? schemas.schemas : schemas;
    const arr = Array.isArray(list) ? list : [list];
    return arr.some(isDraft04Schema);
};

const addMetaSchemaLenient = (_ajv, meta) => {
    const original = _ajv.opts.validateSchema;
    _ajv.opts.validateSchema = false;
    try {
        _ajv.addMetaSchema(meta);
    } finally {
        _ajv.opts.validateSchema = original;
    }
};

const wantsDraft04 = (schemas, opts) => {
    if (opts && opts.draft04 === true) {
        return true;
    }
    return Boolean(schemas && Array.isArray(schemas.meta) && schemas.meta.some(isDraft04Meta));
};

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
    while(_p.length > 0) {
        _p.pop();
        try {
            _o = Object.assign({}, owner.getPath(_p.join(".")), _o);
        } catch (e) {
            _p.splice(0, _p.length-1);
            throw e;
        }
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
    const draft04Requested = wantsDraft04(schemas, opts);
    const hasDraft04Schemas = usesDraft04(schemas);
    const hasDraft07Schemas = usesDraft07(schemas);
    if (hasDraft04Schemas && !draft04Requested) {
        throw new Error("Draft-04 schema detected but draft-04 support is not enabled.");
    }
    const useDraft04 = draft04Requested && hasDraft04Schemas && !hasDraft07Schemas;
    let AjvCtor = Ajv;
    const ajvOpts = (useDraft04 && !opts.schemaId) ? Object.assign({}, opts, {schemaId: "id"}) : opts;
    if (useDraft04) {
        const Draft04 = loadAjvDraft04();
        if (!Draft04) {
            throw new Error("Draft-04 requested but ajv-draft-04 is not installed.");
        }
        AjvCtor = Draft04;
    }
    const _ajv = new AjvCtor(ajvOpts);
    addFormats(_ajv);

    if (schemas) {
        if (schemas.hasOwnProperty("meta")) {
            if (Array.isArray(schemas.meta)) {
                schemas.meta.forEach((meta) => {
                    if (useDraft04 && isDraft04Meta(meta)) {
                        // AjvDraft04 already ships with draft-04 meta schema.
                        return;
                    }
                    if (isDraft04Meta(meta)) {
                        addMetaSchemaLenient(_ajv, meta);
                        return;
                    }
                    _ajv.addMetaSchema(meta);
                });
            }
        }

        if (!useDraft04 && hasDraft07Schemas) {
            if (!_ajv.getSchema(DRAFT_07_META_ID) && !_ajv.getSchema(DRAFT_07_META_ID_HASH)) {
                // eslint-disable-next-line global-require
                _ajv.addMetaSchema(require("ajv/dist/refs/json-schema-draft-07.json"));
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
     * @param owner
     * @param schemas
     * @param ajvOptions
     */
    constructor(owner, schemas, options = {}) {
        // ensures that we are given something that represents a Model object
        if ((!owner) || !(owner instanceof Model)) {
            throw "Model is required at arguments[0]";
        }

        if (_validators.get(this) === void(0)) {
            _validators.set(this, {});
        }

        // defines getter for parent Model reference
        Object.defineProperty(this, "$owner", {
            get: () => owner,
            enumerable: false,
        });

        // applies user specified options over our default Ajv Options
        const opts = Object.assign({}, ajvOptions, options);

        // makes user defined options object accessible for evaluation
        Object.defineProperty(this, "options", {
            get: () => opts,
            enumerable: true,
        });

        // declares default path of root# for validation queries
        this.path = "root#";

        const draft04Requested = wantsDraft04(schemas, opts);
        const hasDraft04Schemas = usesDraft04(schemas);
        const hasDraft07Schemas = usesDraft07(schemas);
        const useDraft04 = draft04Requested && hasDraft04Schemas && !hasDraft07Schemas;

        // appends trailing "#" to end of "id" string if missing
        const _procID = (id) => id.match(/#+$/) === null ? `${id}#` : id;

        // processes schema "id" for JSON-schemas =< v04 and >= v06
        const _procSchema = (_s) => {
            if (_s.hasOwnProperty("$id")) {
                _s["$id"] = _procID(_s["$id"]);
                if (useDraft04 && !_s.hasOwnProperty("id")) {
                    _s["id"] = _s["$id"];
                }
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

            const isRootPath = path === this.path || path === `${this.path}/`;
            if (!isRootPath && path.replace(/(items|properties)\/?/, "").split("/").length) {
                return this.exec(this.path, _preconstruct(path, value, this.$owner));
            }

            throw(e);
        }

        return _res;
    }
}
