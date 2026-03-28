import {
    DataModelPathError,
    DataModelStateError,
    DataModelValidationError,
} from "./errors";
import {
    deleteAtPath,
    getAtPath,
    normalizePath,
    pathToString,
    setAtPath,
} from "./path";
import {createSchemaDeletePolicy, getSchemaAtPath} from "./schema";
import {cloneValue, inferEmptyValue, serializeValue} from "./value";

const normalizeValidator = (validator) => {
    if (!validator) {
        return () => true;
    }

    if (validator instanceof Function) {
        return validator;
    }

    if (validator.validate instanceof Function) {
        return (value) => validator.validate(value);
    }

    throw new TypeError("DataModel validator must be a function or object with validate(value)");
};

const normalizeHooks = (hooks = {}) => ({
    onCommit: hooks.onCommit instanceof Function ? hooks.onCommit : null,
    onFreeze: hooks.onFreeze instanceof Function ? hooks.onFreeze : null,
    onReset: hooks.onReset instanceof Function ? hooks.onReset : null,
    onInvalidCommit: hooks.onInvalidCommit instanceof Function ? hooks.onInvalidCommit : null,
    completeDescendants: hooks.completeDescendants instanceof Function ? hooks.completeDescendants : null,
});

const normalizeDeletePolicy = (deletePolicy) => {
    if (!deletePolicy) {
        return () => true;
    }

    if (deletePolicy instanceof Function) {
        return deletePolicy;
    }

    throw new TypeError("DataModel deletePolicy must be a function");
};

export class DataModel {
    constructor(options = {}) {
        const {
            value,
            emptyValue,
            validator,
            hooks,
            deletePolicy,
            schema,
            validateInitial = true,
        } = options;

        this._validator = normalizeValidator(validator);
        this._hooks = normalizeHooks(hooks);
        this._schema = schema;
        this._deletePolicy = normalizeDeletePolicy(
            deletePolicy || (schema ? createSchemaDeletePolicy(schema) : null),
        );
        this._value = undefined;
        this._emptyValue = cloneValue(
            Object.prototype.hasOwnProperty.call(options, "emptyValue") ?
                emptyValue :
                inferEmptyValue(value),
        );
        this._state = {
            lifecycle: "mutable",
            isFrozen: false,
            version: 0,
            lastAction: "init",
        };

        const initialValue = Object.prototype.hasOwnProperty.call(options, "value") ?
            value :
            this._emptyValue;

        if (validateInitial) {
            this._commit(initialValue, {action: "init", emit: false});
        } else {
            this._value = cloneValue(initialValue);
            this._state = {
                ...this._state,
                version: this._state.version + 1,
                lastAction: "init",
            };
        }
    }

    get lifecycle() {
        return this._state.lifecycle;
    }

    get isFrozen() {
        return this._state.isFrozen;
    }

    get version() {
        return this._state.version;
    }

    get lastAction() {
        return this._state.lastAction;
    }

    get schema() {
        return this._schema;
    }

    validate(value = this._value) {
        return this._validator(value);
    }

    getSchema(path = []) {
        if (!this._schema) {
            return undefined;
        }

        return getSchemaAtPath(this._schema, path);
    }

    validateAt(path, value) {
        const candidate = setAtPath(this._value, path, value);
        return this.validate(candidate);
    }

    snapshot() {
        return serializeValue(this._value);
    }

    toJSON() {
        return this.snapshot();
    }

    replace(value) {
        this._assertMutable("replace");
        this._commit(value, {action: "replace"});
        return this;
    }

    get(path) {
        return getAtPath(this._value, path);
    }

    set(path, value) {
        this._assertMutable("set");
        const candidate = setAtPath(this._value, path, value);
        this._commit(candidate, {
            action: "set",
            meta: {
                path: normalizePath(path),
            },
        });
        return this;
    }

    update(path, updater) {
        this._assertMutable("update");

        if (!(updater instanceof Function)) {
            throw new TypeError("DataModel update(path, updater) requires a function updater");
        }

        const segments = normalizePath(path);
        const currentValue = this.get(segments);

        if (segments.length && currentValue === undefined) {
            throw new DataModelPathError("Path does not exist", {
                path: pathToString(segments),
            });
        }

        return this.set(segments, updater(cloneValue(currentValue)));
    }

    delete(path) {
        this._assertMutable("delete");

        const segments = normalizePath(path);
        const currentValue = this.get(segments);
        const parentPath = segments.slice(0, -1);
        const key = segments[segments.length - 1];
        const parentValue = parentPath.length ? this.get(parentPath) : this._value;
        const policyResult = this._deletePolicy(segments, {
            model: this,
            currentValue,
            parentPath,
            parentValue,
            key,
        });

        if (policyResult !== true) {
            throw new DataModelValidationError(
                typeof policyResult === "string" ? policyResult : "Delete policy rejected path removal",
                {
                    action: "delete",
                    path: segments,
                    currentValue,
                    parentPath,
                    key,
                },
            );
        }

        const candidate = deleteAtPath(this._value, segments);
        this._commit(candidate, {
            action: "delete",
            meta: {
                path: segments,
            },
        });
        return this;
    }

    reset(options = {}) {
        this._assertMutable("reset");

        if (options.complete && this._hooks.completeDescendants) {
            this._hooks.completeDescendants(this._value);
        }

        this._commit(this._emptyValue, {action: "reset"});

        if (this._hooks.onReset) {
            this._hooks.onReset({
                model: this,
                options: {...options},
                snapshot: this.snapshot(),
            });
        }

        return this;
    }

    freeze() {
        if (this.isFrozen) {
            return this;
        }

        this._state = {
            ...this._state,
            lifecycle: "frozen",
            isFrozen: true,
            lastAction: "freeze",
        };

        if (this._hooks.onFreeze) {
            this._hooks.onFreeze({
                model: this,
                snapshot: this.snapshot(),
            });
        }

        return this;
    }

    _assertMutable(action) {
        if (this.isFrozen) {
            throw new DataModelStateError(
                `DataModel cannot ${action} after freeze()`,
                {
                    action,
                    lifecycle: this.lifecycle,
                },
            );
        }
    }

    _commit(value, {action, emit = true, meta = null}) {
        const validationResult = this.validate(value);

        if (validationResult !== true) {
            if (this._hooks.onInvalidCommit) {
                this._hooks.onInvalidCommit({
                    model: this,
                    action,
                    value,
                    validationResult,
                    meta,
                });
            }

            throw new DataModelValidationError(validationResult, {
                action,
                value,
                validationResult,
                meta,
            });
        }

        const previousSnapshot = this._value === undefined ? undefined : this.snapshot();
        this._value = cloneValue(value);
        this._state = {
            ...this._state,
            version: this._state.version + 1,
            lastAction: action,
        };

        if (emit && this._hooks.onCommit) {
            this._hooks.onCommit({
                model: this,
                action,
                previousSnapshot,
                snapshot: this.snapshot(),
                meta,
            });
        }
    }
}
