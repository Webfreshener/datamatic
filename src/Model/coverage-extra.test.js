import {Model} from "./index";
import {PropertiesModel} from "./propertiesModel";
import {BaseModel} from "./base-model";
import {ObserverBuilder} from "./_observerBuilder";
import {MetaData} from "./_metaData";
import {SchemaHelpers} from "./_schemaHelpers";
import Notifiers, {_CompleteNotification, _ErrorNotification} from "./_branchNotifier";
import {
    getDefaults,
    getPatternPropertyDefaults,
    makeDirty,
    refAtKeyValidation,
    validate,
} from "./utils";
import {AjvWrapper} from "./_ajvWrapper";
import {_oBuilders, _schemaHelpers, _observerPaths, _validators, _object} from "./_references";

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
    required: ["name"],
    properties: {
        name: {type: "string"},
        count: {type: "integer"},
        data: {
            type: "object",
            required: ["flag"],
            properties: {
                flag: {type: "boolean"},
            },
        },
        list: {
            type: "array",
            minItems: 1,
            items: {type: "string"},
        },
    },
};

describe("Model and BaseModel extra coverage", () => {
    it("supports schema lookup and model helpers", () => {
        const owner = new Model({schemas: [schemaLegacy, schemaRoot]});
        owner.model = {name: "", count: 0, data: {flag: false}, list: ["a"]};

        expect(owner.getSchemaForKey("legacy#")).toEqual(schemaLegacy);
        expect(owner.getSchemaForKey("root#")).toEqual(schemaRoot);
        expect(owner.getSchemaForPath("/properties/count")).toEqual({type: "integer"});
        expect(owner.schema).toEqual(schemaRoot);
        expect(owner.model.$model.owner).toBe(owner);

        expect(owner.addSchema({$id: "extra#", type: "number"})).toBe(true);
        expect(() => owner.useSchema("root#")).not.toThrow();

        expect(owner.validate("root#/properties/name", "ok")).toBe(true);
        owner.model.name = 1;
        expect(Array.isArray(owner.errors)).toBe(true);

        expect(owner.getPath("properties/name")).toBe("");
        expect(owner.getPath("properties/count")).toBe(0);
        expect(owner.getPath("properties/data/properties/flag")).toBe(false);
        expect(owner.getModelsInPath("properties/data")).toHaveLength(2);

        expect(owner.toString()).toContain("\"name\"");
        expect(owner.toJSON()).toEqual(owner.model.$model.toJSON());

        const sub = owner.subscribeTo("properties/data", {next: () => {}});
        sub.unsubscribe();
    });

    it("supports fromJSON variants and errors", () => {
        const fromObj = Model.fromJSON({schemas: [schemaRoot]});
        expect(fromObj).toBeInstanceOf(Model);
        const fromStr = Model.fromJSON(JSON.stringify({schemas: [schemaRoot]}));
        expect(fromStr).toBeInstanceOf(Model);
        expect(() => Model.fromJSON(1)).toThrow("json must be either JSON formatted string or object");
    });

    it("handles reset complete option and pipeline close", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};

        const child = owner.model.data.$model;
        let completed = false;
        child.subscribe({complete: () => { completed = true; }});

        owner.model.$model.reset();
        expect(completed).toBe(false);

        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        owner.model.$model.reset({complete: true});
        expect(completed).toBe(false);

        const pipeline = owner.model.$model.pipeline();
        owner.freeze();
        expect(pipeline.writable).toBe(false);
    });

    it("covers BaseModel accessors and handlers", () => {
        const base = new BaseModel({_path: "", _parent: null, _root: null, _owner: null});
        expect(base.model).toBeNull();
        expect(base.options).toBeUndefined();
        expect(base.handler.apply()).toBe(false);
        expect(base.handler.setPrototypeOf()).toBe(false);

        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const root = owner.model.$model;
        expect(root.schema).toEqual({});

        const objWithToJSON = {toJSON: () => ({x: 1})};
        owner.model = {name: "ok", data: {flag: true}, list: ["a"], extra: objWithToJSON};
        expect(owner.toJSON().extra).toEqual({x: 1});
    });

    it("skips inherited properties during toJSON", () => {
        const base = new BaseModel({_path: "", _parent: null, _root: null, _owner: null});
        base.valueOf = () => Object.create({inherited: "x"});
        expect(base.toJSON()).toEqual({});
    });

    it("covers BaseModel construction errors and validation fallback", () => {
        expect(() => new BaseModel(1)).toThrow("Invalid attempt to construct Model.");
        const base = new BaseModel({_path: "", _parent: null, _root: null, _owner: null});
        expect(base.validate({})).toBe(true);

        const permissive = new Model({schemas: [{
            $id: "root#",
            type: "object",
            properties: {
                name: {type: "string"},
            },
        }]});
        permissive.model = {name: "ok"};
        permissive.model.$model.reset({complete: true});
        permissive.freeze();
        expect(permissive.isFrozen).toBe(true);

        const resetSchema = {
            $id: "root#",
            type: "object",
            properties: {
                child: {type: "object"},
            },
        };
        const resetOwner = new Model({schemas: [resetSchema]});
        const child = {freeze: jest.fn()};
        resetOwner.model = {child};
        resetOwner.model.$model.reset({complete: true});
        expect(child.freeze).toHaveBeenCalled();
    });

    it("freezes array children on reset with complete", () => {
        const arrayOwner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {
                type: "object",
                properties: {name: {type: "string"}},
            },
        }]});
        const arrayModel = arrayOwner.model.$model;
        const child = {freeze: jest.fn()};
        _object.set(arrayModel, [child]);
        arrayModel.reset({complete: true});
        expect(child.freeze).toHaveBeenCalled();
    });

    it("throws on invalid schema configuration", () => {
        expect(() => new Model({schemas: [{type: 1}]})).toThrow();
    });
});

describe("ObserverBuilder, Notifiers, and MetaData coverage", () => {
    it("handles observer builder paths and notifications", () => {
        const owner = new Model({schemas: [schemaRoot]});
        const builder = new ObserverBuilder();
        const target = owner.model.$model;
        expect(() => builder.create({})).toThrow("target object is invalid");
        expect(builder.create(target)).toBeDefined();
        expect(builder.create(target)).toBeDefined();
        expect(Array.isArray(builder.list())).toBe(true);

        const originalGetObserverForPath = builder.getObserverForPath;
        const observerPaths = {hasOwnProperty: () => false};
        _observerPaths.set(builder, observerPaths);
        builder.getObserverForPath = () => ({path: target.path});
        builder.create(target);
        builder.getObserverForPath = originalGetObserverForPath;

        const observer = builder.getObserverForModel(target);
        expect(observer.path).toBe(target.path);

        let nextCount = 0;
        observer.onNext.subscribe(() => { nextCount += 1; });
        builder.mute(target);
        builder.unmute(target);
        builder.next(target);
        builder.next(null);
        expect(nextCount).toBe(1);

        builder.complete(target);
        builder.error(target, "oops");
    });

    it("sends notifications through Notifiers", async () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const notifier = Notifiers.get(owner);
        let errRef;
        const sub = owner.subscribe({
            next: jest.fn(),
            error: (e) => { errRef = e; },
            complete: jest.fn(),
        });

        notifier.sendNext(".");
        await new Promise((resolve) => setTimeout(resolve, 0));

        notifier.sendError(".", "err");
        expect(errRef.toString()).toContain("err");
        notifier.sendComplete(".");
        sub.unsubscribe();
    });

    it("covers MetaData accessors", () => {
        const originalCreateID = MetaData.prototype._createID;
        MetaData.prototype._createID = null;
        const meta = new MetaData({constructor: {name: "Foo"}}, {
            _path: "root#",
            _root: "root",
            _owner: "owner",
            _parent: "parent",
        });
        expect(typeof meta.objectID).toBe("string");
        expect(meta.root).toBe("root");
        expect(meta.path).toBe("root#");
        expect(meta.owner).toBe("owner");
        expect(meta.parent).toBe("parent");
        expect(meta.set()).toBe(meta);
        expect(() => JSON.parse(meta.toString())).not.toThrow();
        MetaData.prototype._createID = originalCreateID;
    });

    it("exposes CompleteNotification helpers", () => {
        const err = new _ErrorNotification("root#", "bad");
        expect(err.path).toBe("root#");
        expect(err.error).toBe("bad");
        expect(err.toString()).toContain("bad");

        const complete = new _CompleteNotification("root#");
        expect(complete.path).toBe("root#");
    });
});

describe("SchemaHelpers and utils coverage", () => {
    it("covers SchemaHelpers error handling and child creation", () => {
        expect(() => new SchemaHelpers()).toThrow("arguments[0] must be an object");
        const fakeOwner = {};
        _oBuilders.set(fakeOwner, {create: () => {}});
        const fakeRef = {owner: fakeOwner, set: () => "bad"};
        const helper = new SchemaHelpers(fakeRef);
        expect(helper.setObject("value")).toBe("value");
        expect(() => helper.setObject({a: 1})).toThrow("bad");

        const originalCreateSchemaChild = SchemaHelpers.prototype.createSchemaChild;
        SchemaHelpers.prototype.createSchemaChild = () => "bad";
        expect(helper.setChildObject("x", {})).toBe("bad");

        SchemaHelpers.prototype.createSchemaChild = () => null;
        expect(helper.setChildObject("x", {})).toBe("'x' was invalid");
        SchemaHelpers.prototype.createSchemaChild = originalCreateSchemaChild;

        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const realHelper = new SchemaHelpers(owner.model.$model);
        const child = realHelper.createSchemaChild("data", {flag: true});
        expect(child).toBeDefined();
    });

    it("covers utility helpers", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const base = owner.model.$model;

        makeDirty(base);
        expect(refAtKeyValidation(base, "name", "ok")).toBe(true);
        expect(typeof validate(base, "root#/properties/name", 1)).toBe("string");

        const defaults = getDefaults({
            default: {a: 1},
            properties: {
                foo: {default: "bar"},
                nested: {type: "object", properties: {x: {default: 2}}},
            },
        });
        expect(defaults).toEqual({a: 1, foo: "bar", nested: {x: 2}});

        const typeDefaults = getDefaults({
            type: "object",
            properties: {
                inner: {default: 3},
            },
        });
        expect(typeDefaults).toEqual({inner: 3});

        const itemDefaults = getDefaults({
            items: {default: {a: 2}},
        });
        expect(itemDefaults).toEqual({a: 2});

        const deepDefaults = getDefaults({
            items: {
                type: "object",
                properties: {
                    nested: {
                        type: "array",
                        items: {default: {z: 3}},
                    },
                },
            },
        });
        expect(deepDefaults).toEqual({nested: {z: 3}});

        const typedDefaults = getDefaults({
            items: {
                type: "object",
                properties: {value: {default: 5}},
            },
        });
        expect(typedDefaults).toEqual({value: 5});

        expect(getPatternPropertyDefaults(null)).toBeNull();
        const patternDefaults = getPatternPropertyDefaults({
            patternProperties: {
                "^x-": {default: {a: 1}},
            },
        });
        expect(patternDefaults).toEqual({"^x-": {a: 1}});
    });
});

describe("ItemsModel and PropertiesModel edge cases", () => {
    it("covers ItemsModel setter and delete behavior", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        const items = owner.model.$model;
        items.model = "nope";
        expect(items.model).toEqual([]);

        owner.model = ["a"];
        items.freeze();
        items.model = ["b"];
        expect(items.model).toEqual(["a"]);

        const arr = owner.model;
        expect(arr.pop()).toBe(false);

        const objectItemsOwner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {
                type: "object",
                properties: {name: {type: "string"}},
                required: ["name"],
            },
        }]});
        objectItemsOwner.model = [{name: "ok"}];
        expect(() => { objectItemsOwner.model[0] = 1; }).not.toThrow();
    });

    it("covers ItemsModel delete trap error branches", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        owner.model = ["a"];
        const handler = owner.model.$model.handler;
        const originalSplice = Array.prototype.splice;
        Array.prototype.splice = () => { throw new Error("boom"); };
        const res = handler.deleteProperty(owner.model, 0);
        Array.prototype.splice = originalSplice;
        expect(typeof res).toBe("string");

        const owner2 = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        owner2.model = ["a"];
        const res2 = owner2.model.$model.handler.deleteProperty(owner2.model, 0);
        expect(typeof res2).toBe("string");
    });

    it("covers ItemsModel set trap when writable", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {type: "string"},
        }]});
        owner.model = ["a"];
        const res = owner.model.$model.handler.set(owner.model, 0, "b");
        expect(res).toBe(true);
    });

    it("covers ItemsModel delete trap with delegate set", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        const badArray = ["a"];
        badArray.forEach = () => { throw new Error("boom"); };
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(owner.model.$model), "model").set;
        const setResult = setter.call(owner.model.$model, badArray);
        expect(typeof setResult).toBe("string");

        const res = owner.model.$model.handler.deleteProperty(owner.model, 0);
        expect(typeof res).toBe("string");
    });

    it("covers PropertiesModel set handler edge cases", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const props = owner.model.$model;

        props.model = 1;
        expect(props.model.name).toBe("ok");
        props.model = {data: {flag: true}, list: ["a"]};
        expect(props.model.name).toBe("ok");
        props.freeze();
        props.model = {name: "x"};
        expect(props.model.name).toBe("ok");

        const obj = new Model({schemas: [schemaRoot]});
        obj.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const handler = obj.model.$model.handler;
        expect(handler.set({}, "toString", "x")).toBe(true);
        obj.model.$model.freeze();
        expect(() => handler.set({}, "name", "x")).toThrow("non-configurable and non-writable");

        const dirtyOwner = new Model({schemas: [schemaRoot]});
        dirtyOwner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const dirtyProps = dirtyOwner.model.$model;
        makeDirty(dirtyProps);
        expect(dirtyProps.set("count", 1)).toBe(dirtyProps);
        dirtyProps.freeze();
        expect(() => dirtyProps.handler.set(dirtyProps.model, "name", "x"))
            .toThrow("non-configurable and non-writable");

        const noisy = new Model({schemas: [schemaRoot]});
        noisy.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const noisyHandler = noisy.model.$model.handler;
        expect(typeof noisyHandler.set({}, {a: "b"}, "x")).toBe("string");

        const helper = {setObject: () => "bad", setChildObject: () => "bad"};
        _schemaHelpers.set(noisy.model.$model, helper);
        expect(noisyHandler.set(noisy.model, "data", {flag: false})).toContain("unable to create child object");
    });

    it("covers delete traps and nested array updates", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        owner.model = ["a"];
        const handler = owner.model.$model.handler;
        const originalSplice = Array.prototype.splice;
        Array.prototype.splice = () => { throw new Error("boom"); };
        const res = handler.deleteProperty(["a"], 0);
        Array.prototype.splice = originalSplice;
        expect(typeof res).toBe("string");

        const owner2 = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        owner2.model = ["a"];
        const res2 = owner2.model.$model.handler.deleteProperty(["a"], 0);
        expect(typeof res2).toBe("string");

        const nestedSchema = {
            $id: "root#",
            type: "object",
            properties: {
                list: {type: "array", items: {type: "string"}},
            },
        };
        const nested = new Model({schemas: [nestedSchema]});
        nested.model = {list: ["a"]};
        nested.model.list.push("b");
        expect(nested.model.list.length).toBe(2);
    });

    it("covers ItemsModel frozen set trap and invalid assignment", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {type: "string"},
        }]});
        owner.model = ["a"];
        owner.model.$model.freeze();
        expect(() => { owner.model[0] = "b"; }).toThrow("non-configurable and non-writable");
        expect(() => owner.model.$model.handler.set(owner.model, 0, "b"))
            .toThrow("non-configurable and non-writable");
    });

    it("covers ItemsModel setter error paths", () => {
        const owner = new Model({schemas: [{
            $id: "root#",
            type: "array",
            items: {
                type: "object",
                properties: {name: {type: "string"}},
                required: ["name"],
            },
        }]});
        const items = owner.model.$model;
        const helper = {setChildObject: () => { throw new Error("boom"); }};
        _schemaHelpers.set(items, helper);
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(items), "model").set;
        expect(typeof setter.call(items, [{name: "x"}])).toBe("string");
        expect(typeof setter.call(items, [1])).toBe("string");

        owner.model = [{name: "ok"}];
        owner.model.push = () => {};
        owner.model[0] = 1;

        const delSchema = new Model({schemas: [{
            $id: "root#",
            type: "array",
            minItems: 1,
            items: {type: "string"},
        }]});
        delSchema.model = ["a"];
        const delRes = delSchema.model.$model.handler.deleteProperty(["a"], 0);
        expect(typeof delRes).toBe("string");
    });

    it("covers PropertiesModel delete and set failures", () => {
        const owner = new Model({schemas: [schemaRoot]});
        owner.model = {name: "ok", data: {flag: true}, list: ["a"]};
        const res = owner.model.$model.handler.deleteProperty(owner.model, "name");
        expect(res).not.toBe(true);

        const owner2 = new Model({schemas: [schemaRoot]});
        owner2.model = {name: "ok", data: {flag: true}, list: ["a"]};
        expect(owner2.model.$model.set("count", "bad")).toBe(owner2.model.$model);
    });

    it("covers PropertiesModel handler error paths", () => {
        const originalHandler = Object.getOwnPropertyDescriptor(PropertiesModel.prototype, "handler");
        Object.defineProperty(PropertiesModel.prototype, "handler", {
            get: function () {
                return {
                    get: (t, key) => t[key],
                    set: () => { throw new Error("boom"); },
                    deleteProperty: () => true,
                };
            },
        });
        const owner = new Model({schemas: [schemaRoot]});
        const props = owner.model.$model;
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(props), "model").set;
        setter.call(props, {name: "ok"});
        Object.defineProperty(PropertiesModel.prototype, "handler", originalHandler);

        props.model = {name: "ok", data: {flag: true}, list: ["a"]};
        expect(props.get("name")).toBe("ok");

        _schemaHelpers.set(props, {setObject: () => "bad", setChildObject: () => "bad"});
        expect(typeof props.handler.set(props.model, {a: 1}, "x")).toBe("boolean");
        expect(props.handler.set(props.model, "data", {flag: false}))
            .toContain("unable to create child object");

        _schemaHelpers.set(props, {setObject: () => ({}), setChildObject: () => ({})});
        expect(props.handler.set(props.model, {a: 1}, "x")).toBe(true);

        const originalValidator = _validators.get(owner);
        _validators.set(owner, {exec: () => false, $ajv: {errorsText: () => ""}});
        expect(props.set("count", 1)).toBe(false);
        _validators.set(owner, originalValidator);
    });
});

describe("Model AjvWrapper edge cases", () => {
    it("handles constructor guards and schema processing", () => {
        const owner = new Model({schemas: [schemaRoot]});
        expect(() => new AjvWrapper(null, {schemas: [schemaRoot]}))
            .toThrow("Model is required at arguments[0]");

        const wrapper = new AjvWrapper(owner, {schemas: [schemaRoot]});
        expect(wrapper.options).toBeDefined();
        expect(AjvWrapper.resolvePath()).toBe("not yet implemented");
    });

    it("handles string schema entries and exec error paths", () => {
        const owner = new Model({schemas: [schemaRoot]});
        try {
            new AjvWrapper(owner, {schemas: "bad", schema: {id: "bad#"}});
        } catch (e) {
            expect(e).toBeDefined();
        }

        const arrayWrapper = new AjvWrapper(owner, [{$id: "one#"}, {$id: "two#"}]);
        expect(arrayWrapper.$ajv).toBeDefined();

        const wrapper = new AjvWrapper(owner, {schemas: [schemaRoot]});
        const originalValidate = wrapper.$ajv.validate;
        const originalGetPath = owner.getPath;
        wrapper.$ajv.validate = () => { throw new Error("boom"); };
        owner.getPath = () => { throw new Error("nope"); };
        expect(() => wrapper.exec("root#/properties/items", {})).toThrow("nope");
        wrapper.$ajv.validate = originalValidate;
        owner.getPath = originalGetPath;

        const pathObj = {
            indexOf: () => 0,
            replace: () => ({split: () => []}),
        };
        wrapper.$ajv.validate = () => { throw new Error("boom"); };
        expect(() => wrapper.exec(pathObj, {})).toThrow("boom");
        wrapper.$ajv.validate = originalValidate;
    });
});
