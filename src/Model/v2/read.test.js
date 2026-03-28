import {Model} from "../index";
import {_schemaSignatures} from "../_references";
import {
    getLegacyModelPathValue,
    getLegacyModelSchemaForKey,
    getLegacyModelSchemaForPath,
} from "./read";

describe("Model v2 read compat seam", () => {
    it("preserves schema lookup by key and by path", () => {
        const schemaLegacy = {
            id: "legacy#",
            type: "object",
            properties: {
                count: {type: "integer"},
            },
        };
        const schemaRoot = {
            $id: "root#",
            type: "object",
            properties: {
                name: {type: "string"},
                data: {
                    type: "object",
                    properties: {
                        flag: {type: "boolean"},
                    },
                },
            },
        };
        const owner = new Model({schemas: [schemaLegacy, schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}};

        expect(getLegacyModelSchemaForKey(owner, "legacy#")).toEqual(schemaLegacy);
        expect(getLegacyModelSchemaForKey(owner, "root#")).toEqual(schemaRoot);
        expect(getLegacyModelSchemaForPath(owner, "/properties/name")).toEqual({type: "string"});
        expect(getLegacyModelSchemaForPath(owner, "/properties/data/properties/flag"))
            .toEqual({type: "boolean"});
    });

    it("preserves legacy schema id fallback behavior", () => {
        const legacyOnly = Object.create(Model.prototype);
        _schemaSignatures.set(legacyOnly, {schemas: [{id: "only#"}]});

        expect(getLegacyModelSchemaForKey(legacyOnly, "only#").id).toBe("only#");
    });

    it("preserves root-owned getPath helper behavior", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "object",
            properties: {
                name: {type: "string"},
                count: {type: "integer"},
                data: {
                    type: "object",
                    properties: {
                        flag: {type: "boolean"},
                    },
                },
            },
        }]});
        owner.model = {name: "", count: 0, data: {flag: false}};

        expect(getLegacyModelPathValue(owner, "properties/name")).toBe("");
        expect(getLegacyModelPathValue(owner, "properties/count")).toBe(0);
        expect(getLegacyModelPathValue(owner, "properties/data/properties/flag")).toBe(false);
    });
});
