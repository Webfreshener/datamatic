import {Iterator} from "./Iterator";
import {default as DefaultVO} from "../schemas/default-pipe-vo.schema";
import {Pipeline} from "./Pipeline";

describe("TxIterator Tests", () => {
    it("should provide a schema", () => {
        const _voSchema = JSON.stringify(DefaultVO);
        const _schemas = (new Iterator((_) => _ * 2)).schema;
        expect(JSON.stringify(_schemas[0])).toEqual(_voSchema);
        expect(JSON.stringify(_schemas[1])).toEqual(_voSchema);
    });
    it("should loop on array", () => {
        const _ = (
            new Iterator((_) => _ * 2)
        ).loop([1, 3, 5]);
        expect(`${_}`).toEqual("2,6,10");
    });
    it("should error on value that are not iterable", () => {
        const __ = new Iterator((_) => _ * 2);
        expect(() => __.loop({0: 1, 1: 3, 2: 5})).toThrow();
    });
    it("should iterate a schema", () => {
        const __ = (
            new Iterator({type: "number"})
        );
        expect(__.loop([1, 3, 5])).toEqual([1, 3, 5]);
        expect(__.loop([1, "3", 5])).toEqual([1, 5]);
    });
    it("should work within pipeline", (done) => {
        const _cb = jest.fn();
        const _tx = new Pipeline(
            new Iterator( {exec: (d) => d.active === true ? d : void 0}),
        );

        _tx.subscribe({
            next: (d) => {
                expect(d.length).toEqual(2);
                done();
            },
            error: ((e) => {
                _cb();
            }),
        });

        _tx.write([
            {name: "sam", age: 25, active: true},
            {name: "fred", age: 20, active: true},
            {name: "alice", age: 30, active: false},
        ]);
    })
});
