import {yieldLegacyPipeline} from "./yield";

describe("PipelineV2 yield compat helper", () => {
    it("should yield sequential callback outputs without runtime code generation", () => {
        const iterator = yieldLegacyPipeline({
            scope: null,
            pipesOrSchemas: [
                {exec: () => "foo"},
                {exec: () => "bar"},
                {exec: () => "baz"},
            ],
            input: 1,
            emitError: jest.fn(),
        });

        expect(iterator.next().value).toBe("foo");
        expect(iterator.next().value).toBe("bar");
        expect(iterator.next().value).toBe("baz");
        expect(iterator.next().done).toBe(true);
    });

    it("should fall back to identity behavior for empty or exec-less stages", () => {
        const emitError = jest.fn();
        const empty = yieldLegacyPipeline({
            scope: null,
            pipesOrSchemas: [],
            input: 2,
            emitError,
        });
        expect(empty.next().value).toBe(2);

        const fallback = yieldLegacyPipeline({
            scope: null,
            pipesOrSchemas: [{}],
            input: 3,
            emitError,
        });
        expect(fallback.next().value).toBe(3);
        expect(emitError).not.toHaveBeenCalled();
    });

    it("should send thrown errors through the provided error channel", () => {
        const error = new Error("boom");
        const emitError = jest.fn();
        const iterator = yieldLegacyPipeline({
            scope: null,
            pipesOrSchemas: [
                {exec: () => "foo"},
            ],
            input: 1,
            emitError,
        });

        iterator.next();
        iterator.throw(error);
        expect(emitError).toHaveBeenCalledWith(error);
    });
});
