import {Model} from "../index";
import {
    buildDataModelForOwner,
    freezeLegacyModelRoot,
    replaceLegacyModelRoot,
    resetLegacyModelRoot,
} from "./compat";
import {parseModelJSON} from "./json";

export class LegacyModelAdapter {
    constructor(owner) {
        if (!owner || typeof owner !== "object") {
            throw new TypeError("LegacyModelAdapter requires a Model owner");
        }

        this.owner = owner;
        this.dataModel = buildDataModelForOwner(owner);
    }

    syncFromLegacy() {
        this.dataModel = buildDataModelForOwner(this.owner);
        return this.dataModel;
    }

    replace(value) {
        this.dataModel = replaceLegacyModelRoot(this.owner, value, {throwOnError: true});
        return this;
    }

    reset(options = {}) {
        this.dataModel = resetLegacyModelRoot(this.owner, options);
        return this;
    }

    freeze() {
        this.dataModel = freezeLegacyModelRoot(this.owner);
        return this;
    }

    get schema() {
        return this.owner.schema;
    }

    getSchemaForKey(id) {
        return this.owner.getSchemaForKey(id);
    }

    getSchemaForPath(path) {
        return this.owner.getSchemaForPath(path);
    }

    static fromJSON(json, options) {
        return new LegacyModelAdapter(new Model(parseModelJSON(json), options));
    }
}

export const createLegacyModelAdapter = (owner) => new LegacyModelAdapter(owner);
export const createLegacyModelAdapterFromJSON = (json, options) => LegacyModelAdapter.fromJSON(json, options);
