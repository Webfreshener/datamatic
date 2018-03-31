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
 * Holder for registered JS Object references
 *
 * @type {WeakMap}
 * @private
 */
export const _kinds = new WeakMap();
/**
 * Holder for Schema and Set instance references
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
 * Holder for lists of required elements for each Schema Node
 *
 * @type {WeakMap}
 * @private
 */
export const _required_elements = new WeakMap();
/**
 * Holder for Schema Validators
 * @type {WeakMap}
 * @private
 */
export const _validators = new WeakMap();
/**
 * Holder for Singleton instance references
 *
 * @type {WeakMap}
 * @private
 */
export const _singletons = new WeakMap();
/**
 * Holder for `Set` element types
 *
 * @type {WeakMap}
 * @private
 */
export const _vectorTypes = new WeakMap();
/**
 * Holder for Schema options refeerences
 *
 * @type {WeakMap}
 * @private
 */
export const _schemaOptions = new WeakMap();
/**
 * Holder for Schema Helpers references
 *
 * @type {WeakMap}
 * @private
 */
export const _schemaHelpers = new WeakMap();
/**
 * Holder for Schema Signatures references
 *
 * @type {WeakMap}
 * @private
 */
export const _schemaSignatures = new WeakMap();
/**
 * Holder for RXJS Observer references
 * @type {WeakMap}
 * @private
 */
export const _observers = new WeakMap();
/**
 * Holder for Validation path references
 * @type {WeakMap}
 * @private
 */
export const _validPaths = new WeakMap();
/**
 * Holder for Observer Builders
 * @type {WeakMap}
 * @private
 */
export const _oBuilders = new WeakMap();
/**
 * Holder for Validator Builders
 * @type {WeakMap}
 * @private
 */
export const _vBuilders = new WeakMap();
