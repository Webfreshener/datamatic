import {fill, castToExec} from "./Utils";
import {Pipe} from "./Pipe";
import {Validator} from "./Validator";
const _schema = {
    "$id": "root#",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["name"],
    "properties": {
        "name": {
            "type": "string"
        }
    }
};

describe("TxUtils Tests", () => {
    describe("castToExec tests", () => {
        describe("function handling", () => {
            const _func = () => ({res: true});
            it("should accept functions as pipes", () => {
                expect((typeof castToExec(_func).exec)).toEqual("function");
            });
            it("should execute functions as pipes", () => {
                expect(castToExec(_func).exec().res).toBe(true);
            });
        });
        describe("iterator handling", () => {
            it("should cast array to iterator", () => {
                const _res = castToExec([() => "ok"]);
                expect(_res instanceof Pipe).toBe(true);
                expect(JSON.stringify(_res.exec([1, 2, 3]))).toEqual("[\"ok\",\"ok\",\"ok\"]");
            });

            it("should iterate schemas", () => {
                const _res = castToExec([_schema]);
                expect(_res.exec).toBeDefined()
                expect((typeof _res.exec) === "function").toBeTruthy();
                expect(_res.exec([{name: "Testing"}])).toEqual([{name: "Testing"}]);
                expect(_res.exec([{badKey: "Testing"}])).toEqual([]);
            });

            it("should exec", () => {
                const _res = castToExec([() => "ok"]);
                expect(JSON.stringify(new Pipe(_res).exec([1, 2, 3]))).toEqual("[\"ok\",\"ok\",\"ok\"]");
            });
        });
        describe("schema handling", () => {
            it("should accept json-schema", () => {
                const _res = castToExec(_schema);

                expect(_res.exec).toBeDefined()
                expect((typeof _res.exec) === "function").toBeTruthy();
                expect(_res.schema).toBeDefined();
                expect(_res.errors).toBeDefined();
            });
        })
    });

    describe("fill tests", () => {
        it("should fill array with a given value", () => {
            const _ = fill([], () => ({ok: true}));
            expect(_.length).toEqual(2);
            expect(_[0]().ok).toBe(true);
            expect(_[1]().ok).toBe(true);
        });

        it("should handle many callbacks", () => {
            const _ = fill([
                () => ({ok: true}),
                () => ({ok: true}),
                () => ({ok: true}),
                () => ({ok: true}),
                () => ({ok: "yada-yada"}),
            ]);
            expect(_.length).toEqual(5);
            expect(_[0]({ok: true}).ok).toBe(true);
            expect(_[_.length - 1]({ok: true}).ok).toBe("yada-yada");
        });


        it("should not replace existing values", () => {
            const _ = fill([() => ({ok: true})], (d) => d);
            expect(_.length).toEqual(2);
            expect(_[0]({ok: false}).ok).toBe(true);
            expect(_[1]({ok: false}).ok).toBe(false);
        });
    });
});
