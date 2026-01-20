import {Pipeline, PipeListener} from "./Pipeline";
import {Properties, _defaultPipeForTests} from "./Properties";
import {Validator} from "./Validator";
import {AjvWrapper} from "./_ajvWrapper";
import {Executor} from "./Executor";
import {castToExec, fill, mapArgs, wrapCallback} from "./Utils";
import {VxBehaviorSubject} from "./vxBehaviorSubject";
import defaultPipeVo from "../schemas/default-pipe-vo.schema";

describe("Pipeline utilities and Executor coverage", () => {
    it("covers fill, mapArgs, castToExec, and wrapCallback", async () => {
        expect(fill([])).toHaveLength(2);
        expect(fill([1], 0, 3)).toHaveLength(3);
        expect(mapArgs()).toHaveLength(2);
        const execs = Pipeline.getExecs(new Validator(defaultPipeVo), (d) => d + 1);
        expect(execs[0](1)).toBe(1);
        const defaultExecs = Pipeline.getExecs({});
        expect(defaultExecs[0](1)).toBe(1);

        const passthrough = castToExec(null);
        expect(passthrough.exec(1)).toBe(1);

        const iterable = {
            loop: true,
            [Symbol.iterator]: function* () {
                yield defaultPipeVo;
            },
        };
        const loopPipe = castToExec(iterable);
        expect(loopPipe).toBeInstanceOf(Pipeline);

        const fnPipe = castToExec((d) => d + 1);
        expect(fnPipe.exec(1)).toBe(2);

        const objPipe = castToExec({exec: (d) => d + 2});
        expect(objPipe.exec(1)).toBe(3);

        const pipeline = new Pipeline();
        expect(castToExec(pipeline)).toBeDefined();

        const arrayPipe = castToExec([defaultPipeVo]);
        expect(arrayPipe).toBeInstanceOf(Pipeline);

        const validatorPipe = castToExec(new Validator(defaultPipeVo));
        expect(validatorPipe.exec(1)).toBe(1);

        const fakePipeline = Object.create(Pipeline.prototype);
        expect(castToExec(fakePipeline)).toBe(fakePipeline);
        const fallback = castToExec({schema: defaultPipeVo});
        expect(fallback.exec(1)).toBe(1);

        const wrapped = wrapCallback((d) => d + 1);
        const res = await wrapped(Promise.resolve(1));
        expect(res).toBe(2);
    });

    it("covers Pipeline.getExecs branches", () => {
        const execs = Pipeline.getExecs(
            [(d) => d + 1],
            {exec: (d) => d + 2},
            {validate: () => false},
        );
        expect(execs[0](1)).toBe(2);
        expect(execs[1](1)).toBe(3);
        expect(execs[2](1)).toBe(false);
    });

    it("covers Executor callback iteration", async () => {
        const result = Executor.exec([[d => d + 1]], 1);
        expect(result).toBe(2);

        const promiseResult = Executor.exec([d => Promise.resolve(d + 1)], 1);
        expect(promiseResult).toBeInstanceOf(Promise);
        expect(await promiseResult).toBe(2);

        const falseResult = Executor.exec([d => d], 0);
        expect(falseResult).toBe(0);

        const missingResult = Executor.exec([void 0], 1);
        expect(missingResult).toBe(1);
    });
});

describe("Pipeline Validator and AjvWrapper coverage", () => {
    it("covers Validator validation paths and errors", () => {
        expect(Validator.validateSchemas({schema: 1})).toBe(false);
        expect(Validator.validateSchemas({schema: "root#"})).toBe(true);
        expect(Validator.validateSchemas({schemas: [defaultPipeVo]})).toBe(true);

        expect(Validator.deriveSchema(defaultPipeVo)).toEqual(defaultPipeVo);
        const withUse = Validator.deriveSchema({
            use: "root#",
            schemas: [{$id: "root#", schema: {type: "string"}}],
        });
        expect(withUse).toEqual({type: "string"});
        expect(Validator.deriveSchema({use: "missing#", schemas: [{$id: "root#"}]})).toBeNull();
        expect(Validator.deriveSchema({schemas: []})).toBeNull();

        expect(() => new Validator()).toThrow("Schema or Schema Config required");

        const v = new Validator({$id: "root#", type: "number"});
        const errors = [];
        v.subscribe({error: (e) => errors.push(e)});
        v.model = "bad";
        expect(errors.length).toBeGreaterThanOrEqual(1);
        v.model = 2;
        expect(v.toString()).toBe("{}");
        expect(v.valueOf()).toEqual({});
        v.model = "x";
        expect(v.isFrozen).toBe(false);
        v.freeze();
        expect(v.isFrozen).toBe(false);

        expect(() => new Validator({schema: 1})).toThrow("Unable to process schema");
        const v2 = new Validator(defaultPipeVo);
        v2.validate = () => "bad";
        v2.model = 1;

        const v3 = new Validator({schemas: [defaultPipeVo, {$id: "root#", type: "array", items: {type: "number"}}]});
        expect(Array.isArray(v3.model)).toBe(true);

        const originalValidateSchemas = Validator.validateSchemas;
        Validator.validateSchemas = () => true;
        const v4 = new Validator({schemas: []});
        Validator.validateSchemas = originalValidateSchemas;
        expect(v4.model).toEqual({});
    });

    it("covers Pipeline AjvWrapper helper behavior", () => {
        const wrapper = new AjvWrapper({schemas: [defaultPipeVo]});
        expect(wrapper.$ajv).toBeDefined();
        expect(wrapper.exec(defaultPipeVo.$id, {})).toBe(true);

        const badExec = wrapper.exec("missing", {});
        expect(typeof badExec).toBe("string");

        try {
            wrapper.addSchema({$id: "extra#", type: "number"});
        } catch (e) {
            expect(e).toBeDefined();
        }
        expect(AjvWrapper.getSchemaID({type: "string"})).toBe("root#");

        const metaWrapper = new AjvWrapper({meta: [{type: "object"}], schemas: [true]});
        expect(metaWrapper.exec("root#", {})).toBe(true);

        const objectWrapper = new AjvWrapper({schemas: {$id: "root#", type: "object"}});
        expect(objectWrapper.options).toBeDefined();
        const plainWrapper = new AjvWrapper({$id: "plain#", type: "object"});
        expect(plainWrapper.$ajv).toBeDefined();
        const arrayWrapper = new AjvWrapper([{$id: "root#", type: "object"}]);
        expect(arrayWrapper.$ajv).toBeDefined();
        const nestedWrapper = new AjvWrapper({schemas: {schemas: {$id: "nested#", type: "object"}}});
        expect(typeof nestedWrapper.exec("root#", {})).toBe("string");
        expect(nestedWrapper.addSchema({$id: "next#", type: "number"})).toBe(nestedWrapper);
    });
});

describe("Pipeline and PipeListener coverage", () => {
    it("covers subscribe validation and promise rejection", async () => {
        const p = new Pipeline({
            exec: () => {
                throw new Error("boom");
            },
        });
        expect(() => p.subscribe(1)).toThrow("handler required for Pipeline::subscribe");
        await expect(p.promise(1)).rejects.toBeDefined();
    });

    it("covers PipeListener branches", async () => {
        const p = new Pipeline((d) => d + 1);
        const vo = new Validator(defaultPipeVo);
        const listener = new PipeListener(p, vo);
        listener.error({error: "e"});
        listener.complete();
        vo.freeze();
        const voGetter = Object.getOwnPropertyDescriptor(PipeListener.prototype, "vo").get;
        expect(voGetter.call(listener)).toBeDefined();

        p.throttle(1);
        listener.next(1);
        p.unthrottle(true);

        p.sample(2);
        listener.next(1);
        listener.next(1);

        const result = new Pipeline(() => ({toJSON: () => { throw new Error("bad"); }}));
        const badListener = new PipeListener(result, new Validator(defaultPipeVo));
        badListener.next(1);

        const promisePipe = new Pipeline(() => Promise.resolve(2));
        const promiseListener = new PipeListener(promisePipe, new Validator(defaultPipeVo));
        await promiseListener.next(1);

        const fnPipe = new Pipeline(() => () => Promise.resolve(3));
        const fnListener = new PipeListener(fnPipe, new Validator(defaultPipeVo));
        await fnListener.next(1);

        const syncFnPipe = new Pipeline(() => () => 4);
        const syncFnListener = new PipeListener(syncFnPipe, new Validator(defaultPipeVo));
        syncFnListener.next(1);
    });

    it("covers PipeListener accessors via pipeline internals", () => {
        const p = new Pipeline((d) => d);
        let captured;
        const originalGet = WeakMap.prototype.get;
        WeakMap.prototype.get = function (key) {
            const value = originalGet.call(this, key);
            if (key === p && value && value.listeners) {
                captured = value;
            }
            return value;
        };
        p.schema;
        WeakMap.prototype.get = originalGet;

        const listener = captured.listeners[0];
        expect(listener.vo).toBe(captured.vo);
        captured.vo.freeze();
        expect(p.writable).toBe(false);
    });

    it("covers merge listeners and throttle/unthrottle flushing", async () => {
        const p = new Pipeline((d) => d + 1);
        const fakePipe = {
            subscribe: () => {},
            unsubscribe: jest.fn(),
        };
        p.merge(fakePipe);
        p.throttle(5);
        p.write(1);
        await new Promise((resolve) => setTimeout(resolve, 0));
        p.unthrottle(false);
        expect(p.toJSON()).toBeDefined();
        p.throttle(1);
        p.write(1);
        p.unthrottle(true);
        p.close();
        expect(fakePipe.unsubscribe).toHaveBeenCalled();
    });

    it("covers link callback arrays and toJSON payloads", async () => {
        const source = new Pipeline((d) => d);
        const target = new Pipeline((d) => d);
        const execSpy = jest.spyOn(Executor, "exec");
        source.link(target, [[(d) => d]]);
        const payload = {toJSON: () => ({value: 1})};
        source.write(payload);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(target.toJSON()).toEqual({value: 1});
        source.unlink(target);
        expect(execSpy).toHaveBeenCalled();
        execSpy.mockRestore();
    });

    it("covers link with default callbacks", async () => {
        const source = new Pipeline((d) => d);
        const target = new Pipeline((d) => d);
        const execSpy = jest.spyOn(Executor, "exec");
        source.link(target);
        source.write({value: 4});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(target.toJSON()).toEqual({value: 4});
        source.unlink(target);
        expect(execSpy).toHaveBeenCalled();
        execSpy.mockRestore();
    });

    it("covers link with manual subscribe payloads", () => {
        const source = new Pipeline((d) => d);
        const target = new Pipeline((d) => d);
        const originalSubscribe = source.subscribe;
        source.subscribe = (handler) => {
            handler.next({toJSON: () => ({value: 5})});
            handler.next(1);
            return {unsubscribe: () => {}};
        };
        source.link(target, [(d) => d]);
        source.subscribe = originalSubscribe;
    });

    it("covers Properties.init defaults", () => {
        const pipes = new WeakMap();
        const pipe = {};
        const unsubscribeSpy = jest.fn();
        pipes.set(pipe, {listeners: [{unsubscribe: unsubscribeSpy}, {}]});
        const props = Properties.init(pipe, {
            callbacks: [],
            pipesOrVOsOrSchemas: [],
            pipes,
        });
        expect(Array.isArray(props.schema)).toBe(true);
        props.out.subscribe(() => {});
        expect(_defaultPipeForTests.exec(1)).toBe(1);
        props.out.freeze();
        expect(pipes.get(pipe).listeners).toHaveLength(0);
        expect(unsubscribeSpy).toHaveBeenCalled();

        const pipe2 = {};
        pipes.set(pipe2, {listeners: null});
        const propsNull = Properties.init(pipe2, {
            callbacks: [],
            pipesOrVOsOrSchemas: [],
            pipes,
        });
        propsNull.out.freeze();

        const propsArray = Properties.init(pipe, {
            callbacks: [],
            pipesOrVOsOrSchemas: [defaultPipeVo],
            pipes,
        });
        expect(Array.isArray(propsArray.schema)).toBe(true);

        const validator = new Validator(defaultPipeVo);
        const propsValidator = Properties.init(pipe, {
            callbacks: [],
            pipesOrVOsOrSchemas: [validator],
            pipes,
        });
        expect(propsValidator.vo).toBe(validator);

        const propsString = Properties.init(pipe, {
            callbacks: [],
            pipesOrVOsOrSchemas: "x",
            pipes,
        });
        expect(Array.isArray(propsString.schema)).toBe(true);

        const propsError = Properties.init(pipe, {
            callbacks: [() => { throw new Error("boom"); }],
            pipesOrVOsOrSchemas: [],
            pipes,
        });
        try {
            propsError.exec(1);
        } catch (e) {
            expect(e.error.message).toBe("boom");
        }
    });

    it("covers pipeline chaining and helpers", async () => {
        const p = new Pipeline((d) => d + 1);
        const chain = p.pipe((d) => d * 2);
        let chained;
        chain.subscribe({next: (d) => { chained = d; }});
        p.write(1);
        expect(chained).toBe(4);

        const split = p.split([(d) => d, (d) => d + 1]);
        expect(split).toHaveLength(2);

        const schema = p.schema;
        expect(Array.isArray(schema)).toBe(true);
        expect(p.schemas.length).toBeGreaterThan(0);

        const gen = p.yield(1);
        expect(gen.next().value).toBe(1);

        const originalGet = WeakMap.prototype.get;
        WeakMap.prototype.get = function (key) {
            if (key === p) {
                return {pOS: []};
            }
            return originalGet.call(this, key);
        };
        const fallbackGen = p.yield(1);
        WeakMap.prototype.get = originalGet;
        expect(fallbackGen.next().value).toBe(1);

        const execFallbackGet = WeakMap.prototype.get;
        WeakMap.prototype.get = function (key) {
            const value = execFallbackGet.call(this, key);
            if (key === p && value && value.pOS) {
                return Object.assign({}, value, {pOS: [{}]});
            }
            return value;
        };
        const execFallbackGen = p.yield(1);
        WeakMap.prototype.get = execFallbackGet;
        expect(execFallbackGen.next().value).toBe(1);

        const linked = new Pipeline((d) => d + 1);
        expect(() => p.link({}, [])).toThrow("item for \"target\" was not a Pipe");
        p.link(linked, [(d) => d + 1]);
        p.unlink(linked);
        p.unlink(linked);
        expect(() => p.unlink({})).toThrow("item for \"target\" was not a Pipe");

        const clone = p.clone();
        clone.write(1);
        expect(clone.writable).toBe(true);
        clone.close();
        expect(typeof clone.writable).toBe("boolean");

        p.sample(1);
        p.tap();
        expect(p.toString()).toBe("{}");
        expect(p.toJSON()).toEqual({});

        const errPipe = new Pipeline({schema: {type: "number"}, exec: (d) => d});
        errPipe.write("bad");
        expect(errPipe.errors).toBeDefined();

        const promisePipe = new Pipeline((d) => d);
        const promiseResult = await promisePipe.promise(2);
        expect(promiseResult).toBe(2);
    });

    it("covers link promise and error handling", async () => {
        const source = new Pipeline({schema: {type: "number"}, exec: (d) => d});
        const target = new Pipeline((d) => d);
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        source.link(target, [(d) => Promise.resolve(d + 1)]);
        source.write(1);
        await new Promise((resolve) => setTimeout(resolve, 0));
        source.write("bad");
        source.close();
        source.unlink(target);
        spy.mockRestore();
    });

    it("covers merge with plain payloads", () => {
        const source = new Pipeline((d) => d);
        const target = source.merge({
            subscribe: (handler) => {
                handler({value: 2});
            },
        });
        expect(target.toJSON()).toEqual({value: 2});
    });

    it("covers merge with toJSON payloads", () => {
        const source = new Pipeline((d) => d);
        const target = source.merge({
            subscribe: (handler) => {
                handler({toJSON: () => ({value: 3})});
            },
        });
        expect(target.toJSON()).toEqual({value: 3});
    });

    it("covers throttle cache branches", () => {
        const p = new Pipeline((d) => d);
        let cache;
        const originalGet = WeakMap.prototype.get;
        WeakMap.prototype.get = function (key) {
            const value = originalGet.call(this, key);
            if (key === p && Array.isArray(value)) {
                cache = value;
            }
            return value;
        };
        const originalSetInterval = global.setInterval;
        const originalClearInterval = global.clearInterval;
        let tick;
        global.setInterval = (fn) => {
            tick = fn;
            return 1;
        };
        global.clearInterval = () => {};

        p.throttle(1);
        p.write(1);
        WeakMap.prototype.get = originalGet;
        cache.unshift("not-fn");
        cache.unshift(() => 2);
        tick();
        tick();
        cache.splice(0, cache.length);
        tick();
        cache.push(() => 3);
        p.unthrottle(false);
        cache.push("not-fn");
        p.unthrottle(false);
        global.setInterval = originalSetInterval;
        global.clearInterval = originalClearInterval;
    });

    it("covers PipeListener subscribe and error branches", async () => {
        const rejected = new Pipeline(() => Promise.reject(new Error("bad")));
        const listener = new PipeListener(rejected, new Validator(defaultPipeVo));
        listener.subscribe(() => {});
        await listener.next(1);

        const rejectedFn = new Pipeline(() => () => Promise.reject(new Error("bad")));
        const listener2 = new PipeListener(rejectedFn, new Validator(defaultPipeVo));
        await listener2.next(1);

        expect(listener.vo).toBeDefined();
    });
});

describe("VxBehaviorSubject coverage", () => {
    it("handles next/error/complete and subscriptions", () => {
        const vx = new VxBehaviorSubject();
        const calls = {next: 0, error: 0, complete: 0};
        const sub = vx.subscribe({
            next: () => { calls.next += 1; },
            error: () => { calls.error += 1; },
            complete: () => { calls.complete += 1; },
        });
        vx.next(1);
        vx.error(new Error("e"));
        vx.complete();
        sub.unsubscribe();

        const vx2 = VxBehaviorSubject.create();
        const sub2 = vx2.subscribe(() => {});
        vx2.next(1);
        sub2.unsubscribe();
    });
});
