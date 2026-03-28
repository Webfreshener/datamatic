import {Model} from "../index";
import {
    buildDataModelForOwner,
    freezeLegacyModelRoot,
    replaceLegacyModelRoot,
    resetLegacyModelRoot,
} from "./compat";
import {DataModelValidationError} from "./errors";

const schemaRoot = {
    $id: "root#",
    type: "object",
    required: ["name"],
    properties: {
        name: {type: "string"},
        count: {type: "integer"},
    },
};

describe("Model v2 compat helpers", () => {
    it("builds a shadow DataModel from a legacy owner", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", count: 1};

        const dataModel = buildDataModelForOwner(owner);

        expect(dataModel.snapshot()).toEqual({name: "ok", count: 1});
        expect(dataModel.schema).toEqual(schemaRoot);
    });

    it("replaces the legacy root through the compat seam", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", count: 1};

        const shadow = replaceLegacyModelRoot(owner, {name: "next", count: 2});

        expect(owner.toJSON()).toEqual({name: "next", count: 2});
        expect(shadow.snapshot()).toEqual({name: "next", count: 2});
    });

    it("preserves legacy invalid root replacement behavior by not mutating state", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", count: 1};

        expect(() => replaceLegacyModelRoot(owner, {count: 2})).not.toThrow();
        expect(owner.toJSON()).toEqual({name: "ok", count: 1});
    });

    it("can opt into throwing validation errors for adapter-owned replacement", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", count: 1};

        expect(() => replaceLegacyModelRoot(owner, {count: 2}, {throwOnError: true}))
            .toThrow(DataModelValidationError);
        expect(owner.toJSON()).toEqual({name: "ok", count: 1});
    });

    it("preserves legacy required-root reset behavior and still freezes through compat helpers", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", count: 1};

        const resetShadow = resetLegacyModelRoot(owner);
        expect(resetShadow.snapshot()).toEqual({name: "ok", count: 1});
        expect(owner.toJSON()).toEqual({name: "ok", count: 1});

        owner.model = {name: "done", count: 3};
        const pipeline = owner.model.$model.pipeline();
        const frozenShadow = freezeLegacyModelRoot(owner);

        expect(frozenShadow.isFrozen).toBe(true);
        expect(owner.isFrozen).toBe(true);
        expect(pipeline.writable).toBe(false);
    });

    it("resets optional-root objects through the compat seam", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "object",
            properties: {
                name: {type: "string"},
                count: {type: "integer"},
            },
        }]});
        owner.model = {name: "ok", count: 1};

        const resetShadow = resetLegacyModelRoot(owner);

        expect(resetShadow.snapshot()).toEqual({});
        expect(owner.toJSON()).toEqual({});
    });
});
