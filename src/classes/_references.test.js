import each from "jest-each";
import {
    _validators, _schemaHelpers,
    _exists, _kinds, _mdRef, _object,
    _observers, _required_elements
} from "./_references";

describe("Maps Units", () => {
    describe("_exists method", () => {
        it("expects _exists to be defined", () => {
            expect(typeof _exists).toBe("function");
        });
    });

    describe("Shared WeakMap Reference Holders", () => {
        each([
            [_validators, WeakMap, true],
            [_schemaHelpers, WeakMap, true],
            [_kinds, WeakMap, true],
            [_mdRef, WeakMap, true],
            [_object, WeakMap, true],
            [_observers, WeakMap, true],
            [_required_elements, WeakMap, true],
        ])
            .it("expects %s to be a Weakmap", (a, b, expected) => {
                expect(a instanceof b).toBe(expected);
            });
    });
});
