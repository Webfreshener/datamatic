import {JSD} from "./jsd";

describe("Set RXJS Test Suite", function () {
    describe("Set Item Operations", () => {
        let _set;
        beforeEach(() => {
            _set = new JSD([{type: "String"}]);
        });

        it("should observe item additions", (done) => {
            _set.document.subscribe({
                next: (collection) => {
                    expect(collection.length).toBe(1);
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                },
            });
            _set.document.addItem("1");
        });

        it("should observe item removals", (done) => {
            _set.document.addItem("1");
            _set.document.subscribe({
                next: (collection) => {
                    expect(collection.length).toBe(0);
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                },
            });
            _set.document.removeItemAt(0);
        });

        it("should observe item replacement", (done) => {
            _set.document.addItem("1");
            _set.document.subscribe({
                next: (collection) => {
                    expect(collection.length).toBe(1);
                    expect(collection.model[0]).toBe("2");
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                },
            });
            _set.document.replaceItemAt(0, "2");
        });

        it("should observe list replacement", (done) => {
            _set.document.model = ["1", "2", "3", "4"];
            _set.document.subscribe({
                next: (collection) => {
                    expect(collection.length).toBe(3);
                    expect(collection.model.join("")).toBe("ABC");
                    done();
                },
                error: (e) => {
                    done(`${e}`);
                },
            });
            _set.document.replaceAll(["A", "B", "C"]);
        });

        it("should observe list replacement error", (done) => {
            _set.document.model = ["1", "2", "3", "4"];
            const _sub = _set.document.subscribe({
                next: (collection) => {
                    done("should not have succeeded");
                },
                error: (e) => {
                    _sub.unsubscribe();
                    expect(e).toBe("'.*.polymorphic.0' expected string, type was '<number>'");
                    done();
                },
            });
            expect(() => _set.document.replaceAll(["A", 2, "C"])).not.toThrow();
        });
    });
});