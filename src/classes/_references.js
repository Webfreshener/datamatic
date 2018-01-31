/**
 * @private Weakmap Refs
 * @type {{wf: *, _kinds: WeakMap, _object: WeakMap, _mdRef: WeakMap, _required_elements: WeakMap, _validators: WeakMap, _singletons: WeakMap, _vectorTypes: WeakMap, _schemaOptions: WeakMap, _schemaHelpers: WeakMap, _schemaSignatures: WeakMap, _observers: WeakMap}}
 */
import * as wfUtils from 'wf-utils';
export const _exists = wfUtils.exists;
export const wf = wfUtils;
    // holds references to registered JS Objects
export const _kinds = new WeakMap();
    // Schema and Set instance references
export const _object = new WeakMap();
// MetaData references
export const _mdRef = new WeakMap();
// Lists of required elements for each Schema Node
export const _required_elements = new WeakMap();
// Schema Validators
export const _validators = new WeakMap();
// Singleton instance references
export const _singletons = new WeakMap();
// Set element types
export const _vectorTypes = new WeakMap();
// Schema options refeerences
export const _schemaOptions = new WeakMap();
// Schema Helpers references
export const _schemaHelpers = new WeakMap();
// Schema Signatures references
export const _schemaSignatures = new WeakMap();
// RXJS Observer references
export const _observers = new WeakMap();
export const _validPaths = new WeakMap();

