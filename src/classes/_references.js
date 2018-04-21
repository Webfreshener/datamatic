/**
 * @private Weakmap Refs
 */
import {exists, Fun, Obj, Str} from "jsd-utils";
export const _exists = exists;
export const wf = {
    Fun:Fun,
    Obj: Obj,
    Str: Str
};

/**
 * Holder for PropertiesModel and ItemsModel instance references
 *
 * @type {WeakMap}
 * @private
 */
export const _object = new WeakMap();
/**
 * Holder for MetaData references
 * @type {WeakMap}
 * @private
 */
export const _mdRef = new WeakMap();
/**
 * Holder for AjvWrapper references
 * @type {WeakMap<Object, ajv>}
 * @private
 */
export const _ajvRef = new WeakMap();
/**
 * Holder for models in transition
 *
 * @type {WeakMap}
 * @private
 */
export const _dirtyModels = new WeakMap();
/**
 * Holder for PropertiesModel Validators
 * @type {WeakMap}
 * @private
 */
export const _validators = new WeakMap();
/**
 * Holder for PropertiesModel options refeerences
 *
 * @type {WeakMap}
 * @private
 */
export const _schemaOptions = new WeakMap();
/**
 * Holder for PropertiesModel Helpers references
 *
 * @type {WeakMap}
 * @private
 */
export const _schemaHelpers = new WeakMap();
/**
 * Holder for RXJS Observer references
 * @type {WeakMap}
 * @private
 */
export const _observers = new WeakMap();

/**
 * Holder for RXJS Observer references
 * @type {WeakMap}
 * @private
 */
export const _observerPaths = new WeakMap();


/**
 * Holder for Observer Builders
 * @type {WeakMap}
 * @private
 */
export const _oBuilders = new WeakMap();
/**
 * Holder for JSON-Schemas
 * @type {WeakMap}
 * @private
 */
export const _schemaSignatures = new WeakMap();

export const _rxvoDocs = new WeakMap();
