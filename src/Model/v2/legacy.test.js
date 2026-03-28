import {Model} from "../index";
import {
    LegacyModelAdapter,
    createLegacyModelAdapter,
    createLegacyModelAdapterFromJSON,
    DataModelStateError,
    DataModelValidationError,
} from "./index";

describe("LegacyModelAdapter", () => {
    it("should mirror valid and invalid root replacement through a DataModel seam", () => {
        const schema = {
            $id: "root#",
            type: "object",
            required: ["name"],
            properties: {
                name: {type: "string"},
                active: {type: "boolean"},
            },
        };
        const owner = new Model({schemas: [schema]});
        owner.model = {name: "ok", active: true};

        const adapter = createLegacyModelAdapter(owner);

        adapter.replace({name: "next", active: false});
        expect(owner.toJSON()).toEqual({name: "next", active: false});
        expect(adapter.dataModel.snapshot()).toEqual({name: "next", active: false});

        expect(() => adapter.replace({name: "bad", active: "false"}))
            .toThrow(DataModelValidationError);
        expect(owner.toJSON()).toEqual({name: "next", active: false});
        expect(adapter.dataModel.snapshot()).toEqual({name: "next", active: false});
    });

    it("should mirror root reset onto the legacy runtime", () => {
        const schema = {
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
        const owner = new Model({schemas: [schema]});
        owner.model = {name: "ok", data: {flag: true}};

        const adapter = createLegacyModelAdapter(owner);
        adapter.reset();

        expect(owner.toJSON()).toEqual({});
        expect(adapter.dataModel.snapshot()).toEqual({});
        expect(adapter.dataModel.lastAction).toBe("init");
    });

    it("should preserve complete reset side effects on the legacy runtime", () => {
        const schema = {
            $id: "root#",
            type: "object",
            properties: {
                child: {type: "object"},
            },
        };
        const child = {freeze: jest.fn()};
        const owner = new Model({schemas: [schema]});
        owner.model = {child};

        const adapter = createLegacyModelAdapter(owner);
        adapter.reset({complete: true});

        expect(child.freeze).toHaveBeenCalled();
        expect(owner.toJSON()).toEqual({});
        expect(adapter.dataModel.snapshot()).toEqual({});
    });

    it("should mirror freeze onto the legacy runtime and close model-origin pipelines", () => {
        const schema = {
            $id: "root#",
            type: "object",
            properties: {
                name: {type: "string"},
            },
        };
        const owner = new Model({schemas: [schema]});
        owner.model = {name: "ok"};

        const pipeline = owner.model.$model.pipeline();
        const adapter = createLegacyModelAdapter(owner);
        adapter.freeze();

        expect(owner.isFrozen).toBe(true);
        expect(adapter.dataModel.isFrozen).toBe(true);
        expect(pipeline.writable).toBe(false);
        expect(() => adapter.dataModel.set("name", "later"))
            .toThrow(DataModelStateError);
    });

    it("should mirror array-root replacement and reset through the legacy runtime", () => {
        const schema = {
            $id: "root#",
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {type: "string"},
                },
                required: ["name"],
            },
        };
        const owner = new Model({schemas: [schema]});
        owner.model = [{name: "Item A"}];

        const adapter = createLegacyModelAdapter(owner);
        adapter.replace([{name: "Item B"}]);
        expect(owner.toJSON()).toEqual([{name: "Item B"}]);
        expect(adapter.dataModel.snapshot()).toEqual([{name: "Item B"}]);

        adapter.reset();
        expect(owner.toJSON()).toEqual([]);
        expect(adapter.dataModel.snapshot()).toEqual([]);
    });

    it("should expose legacy schema lookup helpers through the adapter seam", () => {
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

        const adapter = createLegacyModelAdapter(owner);

        expect(adapter.schema).toEqual(schemaRoot);
        expect(adapter.getSchemaForKey("legacy#")).toEqual(schemaLegacy);
        expect(adapter.getSchemaForPath("/properties/name")).toEqual({type: "string"});
        expect(adapter.getSchemaForPath("/properties/data/properties/flag"))
            .toEqual({type: "boolean"});
    });

    it("should support creating a legacy adapter from JSON-compatible model input", () => {
        const payload = {
            schemas: [{
                $id: "root#",
                type: "object",
                properties: {
                    name: {type: "string"},
                },
            }],
        };

        const fromObject = createLegacyModelAdapterFromJSON(payload);
        const fromString = LegacyModelAdapter.fromJSON(JSON.stringify(payload));

        expect(fromObject).toBeInstanceOf(LegacyModelAdapter);
        expect(fromObject.owner).toBeInstanceOf(Model);
        expect(fromObject.dataModel.snapshot()).toEqual({});
        expect(fromString).toBeInstanceOf(LegacyModelAdapter);
        expect(() => LegacyModelAdapter.fromJSON(1))
            .toThrow("json must be either JSON formatted string or object");
    });
});
