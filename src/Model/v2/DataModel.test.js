import {
    DataModel,
    DataModelPathError,
    DataModelStateError,
    DataModelValidationError,
} from "./index";
import {nestedPatternModel} from "../../../fixtures/PropertiesModel.schemas";

const validateRoot = (value) => {
    if (Array.isArray(value)) {
        return "data must be object";
    }

    if (!value || typeof value !== "object") {
        return "data must be object";
    }

    if (typeof value.name !== "string") {
        return "data/name must be string";
    }

    if (!value.data || typeof value.data !== "object") {
        return "data/data must be object";
    }

    if (typeof value.data.flag !== "boolean") {
        return "data/data/flag must be boolean";
    }

    if (value.list !== undefined) {
        if (!Array.isArray(value.list)) {
            return "data/list must be array";
        }

        if (value.list.some((item) => typeof item !== "string")) {
            return "data/list must contain only strings";
        }
    }

    return true;
};

describe("DataModel", () => {
    it("should commit valid root replacement through an explicit lifecycle core", () => {
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}},
            emptyValue: {},
            validator: validateRoot,
        });

        model.replace({name: "next", data: {flag: false}});

        expect(model.lifecycle).toBe("mutable");
        expect(model.lastAction).toBe("replace");
        expect(model.snapshot()).toEqual({name: "next", data: {flag: false}});
        expect(model.version).toBe(2);
    });

    it("should reject invalid replacement without corrupting committed state", () => {
        const invalidCommits = [];
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}},
            emptyValue: {},
            validator: validateRoot,
            hooks: {
                onInvalidCommit: (event) => invalidCommits.push(event),
            },
        });

        expect(() => model.replace({name: 1, data: {flag: true}}))
            .toThrow(DataModelValidationError);
        expect(model.snapshot()).toEqual({name: "ok", data: {flag: true}});
        expect(invalidCommits).toHaveLength(1);
        expect(invalidCommits[0].action).toBe("replace");
    });

    it("should freeze explicitly and reject further mutation", () => {
        const frozenSnapshots = [];
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}},
            emptyValue: {},
            validator: validateRoot,
            hooks: {
                onFreeze: ({snapshot}) => frozenSnapshots.push(snapshot),
            },
        });

        model.freeze();

        expect(model.isFrozen).toBe(true);
        expect(model.lifecycle).toBe("frozen");
        expect(() => model.replace({name: "nope", data: {flag: true}}))
            .toThrow(DataModelStateError);
        expect(frozenSnapshots).toEqual([{name: "ok", data: {flag: true}}]);
    });

    it("should reset to the configured empty value without descendant completion by default", () => {
        const completed = [];
        const resets = [];
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}},
            emptyValue: {name: "", data: {flag: false}},
            validator: validateRoot,
            hooks: {
                completeDescendants: (value) => completed.push(value),
                onReset: (event) => resets.push(event),
            },
        });

        model.reset();

        expect(completed).toEqual([]);
        expect(resets).toHaveLength(1);
        expect(model.snapshot()).toEqual({name: "", data: {flag: false}});
        expect(model.lastAction).toBe("reset");
    });

    it("should invoke descendant completion before reset when complete is requested", () => {
        const completed = [];
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}},
            emptyValue: {name: "", data: {flag: false}},
            validator: validateRoot,
            hooks: {
                completeDescendants: (value) => completed.push(value),
            },
        });

        model.reset({complete: true});

        expect(completed).toEqual([{name: "ok", data: {flag: true}}]);
        expect(model.snapshot()).toEqual({name: "", data: {flag: false}});
    });

    it("should serialize snapshots deterministically from JSON-like values", () => {
        const model = new DataModel({
            value: {
                name: "ok",
                data: {flag: true},
                extra: {
                    toJSON: () => ({normalized: true}),
                },
            },
            emptyValue: {},
            validator: () => true,
        });

        const inherited = Object.create({hidden: true});
        inherited.name = "ok";
        inherited.data = {flag: true};
        model.replace(inherited);

        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
        });
        expect(model.toJSON()).toEqual({
            name: "ok",
            data: {flag: true},
        });
    });

    it("should support validator objects and reject invalid initial state", () => {
        const validator = {
            validate: (value) => value === null ? true : "data must be null",
        };

        const model = new DataModel({
            value: null,
            validator,
        });

        expect(model.snapshot()).toBeNull();
        expect(() => new DataModel({
            value: {bad: true},
            validator,
        })).toThrow(DataModelValidationError);
    });

    it("should allow compat bootstrap from invalid initial state when explicitly requested", () => {
        const model = new DataModel({
            value: {},
            validateInitial: false,
            validator: (value) => typeof value.name === "string" ?
                true :
                "data/name must be string",
        });

        expect(model.snapshot()).toEqual({});

        model.replace({name: "ok"});

        expect(model.snapshot()).toEqual({name: "ok"});
    });

    it("should support explicit nested path reads and writes", () => {
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}, list: ["a", "b"]},
            emptyValue: {},
            validator: validateRoot,
        });

        expect(model.get("data.flag")).toBe(true);
        expect(model.get(["list", 1])).toBe("b");

        model.set("data.flag", false);
        model.set(["list", 1], "c");

        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: false},
            list: ["a", "c"],
        });
    });

    it("should support explicit nested updates without mutating current state first", () => {
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}, list: ["a"]},
            emptyValue: {},
            validator: validateRoot,
        });

        model.update("data", (current) => ({
            ...current,
            flag: false,
        }));

        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: false},
            list: ["a"],
        });
    });

    it("should validate a path candidate without committing it", () => {
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}, list: ["a"]},
            emptyValue: {},
            validator: validateRoot,
        });

        expect(model.validateAt("data.flag", false)).toBe(true);
        expect(model.validateAt("data.flag", "bad")).toBe("data/data/flag must be boolean");
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a"],
        });
    });

    it("should reject invalid nested writes without corrupting committed state", () => {
        const invalidCommits = [];
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}, list: ["a"]},
            emptyValue: {},
            validator: validateRoot,
            hooks: {
                onInvalidCommit: (event) => invalidCommits.push(event),
            },
        });

        expect(() => model.set("data.flag", "bad")).toThrow(DataModelValidationError);
        expect(() => model.set(["list", 0], 1)).toThrow(DataModelValidationError);
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a"],
        });
        expect(invalidCommits).toHaveLength(2);
        expect(invalidCommits[0].meta.path).toEqual(["data", "flag"]);
    });

    it("should make delete policy explicit instead of hidden in mutation traps", () => {
        const model = new DataModel({
            value: {
                name: "ok",
                data: {flag: true, extra: true},
                list: ["a", "b"],
            },
            emptyValue: {},
            validator: validateRoot,
            deletePolicy: (path) => (
                path.join(".") === "data.extra" ?
                    true :
                    "required field cannot be deleted"
            ),
        });

        model.delete("data.extra");
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a", "b"],
        });

        expect(() => model.delete("name")).toThrow("required field cannot be deleted");
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a", "b"],
        });
    });

    it("should reject invalid or missing path traversal explicitly", () => {
        const model = new DataModel({
            value: {name: "ok", data: {flag: true}, list: ["a"]},
            emptyValue: {},
            validator: validateRoot,
        });

        expect(() => model.set("data.flag.value", false)).toThrow(DataModelPathError);
        expect(() => model.update("missing.path", () => "x")).toThrow(DataModelPathError);
        expect(() => model.delete("missing.path")).toThrow(DataModelPathError);
    });

    it("should resolve object, array, and pattern schemas by explicit path", () => {
        const model = new DataModel({
            value: {
                name: "ok",
                data: {flag: true},
                list: ["a"],
            },
            emptyValue: {},
            validator: validateRoot,
            schema: {
                $id: "root#",
                type: "object",
                properties: {
                    name: {type: "string"},
                    data: {
                        type: "object",
                        properties: {
                            flag: {type: "boolean"},
                        },
                        required: ["flag"],
                    },
                    list: {
                        type: "array",
                        items: {type: "string"},
                    },
                },
            },
        });

        expect(model.getSchema("data.flag")).toEqual({type: "boolean"});
        expect(model.getSchema(["list", 0])).toEqual({type: "string"});

        const patternModel = new DataModel({
            value: {nested: {alpha: {value: "ok"}}},
            emptyValue: {},
            validator: () => true,
            schema: nestedPatternModel,
        });

        expect(patternModel.getSchema("nested.alpha")).toEqual({
            type: "object",
            default: {
                value: "default value",
            },
        });
    });

    it("should derive delete policy from schema when no override is provided", () => {
        const model = new DataModel({
            value: {
                name: "ok",
                data: {flag: true},
                list: ["a", "b"],
            },
            emptyValue: {},
            validator: validateRoot,
            schema: {
                $id: "root#",
                type: "object",
                required: ["name"],
                properties: {
                    name: {type: "string"},
                    data: {
                        type: "object",
                        required: ["flag"],
                        properties: {
                            flag: {type: "boolean"},
                            extra: {type: "string"},
                        },
                    },
                    list: {
                        type: "array",
                        minItems: 1,
                        items: {type: "string"},
                    },
                },
            },
        });

        expect(() => model.delete("name"))
            .toThrow("required field cannot be deleted: name");
        expect(() => model.delete("data.flag"))
            .toThrow("required field cannot be deleted: flag");

        model.set("data.extra", "x");
        model.delete("data.extra");
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a", "b"],
        });

        model.delete(["list", 1]);
        expect(model.snapshot()).toEqual({
            name: "ok",
            data: {flag: true},
            list: ["a"],
        });
        expect(() => model.delete(["list", 0]))
            .toThrow("array element cannot be deleted below minItems: 1");
    });
});
