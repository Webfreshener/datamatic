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
import {AjvWrapper} from "./_ajvWrapper";
import {VxBehaviorSubject} from "./vxBehaviorSubject";
import {default as TxArgs} from "../schemas/pipe-args.schema";
import {default as DefaultVO} from "../schemas/default-pipe-vo.schema";

const _models = new WeakMap();
const _validators = new WeakMap();
export const _observers = new WeakMap();

const argsValidator = new AjvWrapper({schemas: [TxArgs]});

export class Validator {
    /**
     *
     * @param schemas
     * @returns {boolean}
     */
    static validateSchemas(schemas) {
        if (schemas["schema"]) {
            if (typeof schemas.schema === "string") {
                return argsValidator.exec(TxArgs.$id, schemas);
            }
            return false;
        }
        if (schemas["schemas"]) {
            return argsValidator.exec(TxArgs.$id, schemas.schemas);
        }

        return argsValidator.exec(TxArgs.$id, schemas);
    }

    /**
     *
     * @param schemasOrConfig
     * @returns {Object|null|*|undefined}
     */
    static deriveSchema(schemasOrConfig) {
        if ((typeof schemasOrConfig) === "object" && !schemasOrConfig.schemas) {
            return schemasOrConfig;
        }

        if (schemasOrConfig.use) {
            return schemasOrConfig.schemas.find((_) => _.$id === schemasOrConfig.use).schema;
        }

        return schemasOrConfig.schemas.length ? schemasOrConfig.schemas[schemasOrConfig.schemas.length - 1] : null;
    }

    /**
     * Accepts one `json-schema` or `tx-config` per instance and an (optional) Ajv config
     * @param schemaOrConfig
     * @param options (optional)
     */
    constructor(schemaOrConfig, options) {
        if (!schemaOrConfig) {
            throw "Schema or Schema Config required";
        }
        if (!Validator.validateSchemas(schemaOrConfig)) {
            throw `Unable to process schema: ${JSON.stringify(argsValidator.$ajv.errors)}`;
        }

        if (!schemaOrConfig["schemas"]) {
            schemaOrConfig = {
                schemas: Array.isArray(schemaOrConfig) ? schemaOrConfig : [schemaOrConfig],
            };
        }

        Object.defineProperty(this, "schema", {
            value: Validator.deriveSchema(schemaOrConfig) || {schemas: [DefaultVO]},
            enumerable: true,
        });

        const _baseSchema = schemaOrConfig.schemas[schemaOrConfig.schemas.length - 1] || DefaultVO;

        // this is just a quick guess at our default data type (object|array)
        _models.set(this, _baseSchema.hasOwnProperty("items") ? [] : {});

        _observers.set(this, new VxBehaviorSubject());

        _validators.set(this, new AjvWrapper(schemaOrConfig, options || {}));
    }

    /**
     * Applies Object.freeze to model and triggers complete notification for pipeline
     * @returns {Validator}
     */
    freeze() {
        _models.set(this, Object.freeze(_models.get(this)));
        _observers.get(this).complete();
        return this;
    }

    /**
     * Getter for Object.isFrozen status of this node and it's ancestors
     * @returns {boolean}
     */
    get isFrozen() {
        if ((typeof _models.get(this)) !== "object") {
            return false;
        }
        return Object.isFrozen(_models.get(this));
    }

    /**
     * Getter for validation errors incurred from model setter
     * @returns {*}
     */
    get errors() {
        return _validators.get(this).$ajv.errors;
    }

    /**
     * Registers notification handler to observable
     * @param handler
     * @returns {*}
     */
    subscribe(handler) {
        return _observers.get(this).subscribe(handler);
    }

    /**
     * Performs schema validation of value
     * @param value
     */
    validate(value) {
        const $id = AjvWrapper.getSchemaID(this.schema[0] || this.schema);
        const __ = _validators.get(this).exec($id, value);
        if (this.errors) {
            _observers.get(this).error({
                error: this.errors,
                data: value,
            });
        }
        return __;
    }

    /**
     * Setter for validator data value
     * @param data
     */
    set model(data) {
        if (this.isFrozen) {
            return;
        }

        const _t = this.validate(data);
        if (_t === true) {
            _models.set(this, data);
            _observers.get(this).next(data);
        } else {
            if (_t === false) {
                _observers.get(this).error({
                    error: this.errors,
                    data: data,
                });
            } else {
                _observers.get(this).error({
                    error: _t,
                    data: data,
                });
            }
        }
    }

    /**
     * Getter for validator data value
     * @returns {{}|[]}
     */
    get model() {
        const _d = _models.get(this);
        return Array.isArray(_d) ? [..._d] : Object.assign({}, _d);
    }

    /**
     * Provides model value as JSON
     * @returns {{}|*[]}
     */
    toJSON() {
        return this.model;
    }

    /**
     * Overrides toString. Provides model value as String
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.model);
    }

    /**
     * Overrides valueOf. Provides model value as JSON
     * @returns {{}|*[]}
     */
    valueOf() {
        return this.model;
    }
}
