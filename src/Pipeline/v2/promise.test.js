import {
    createLegacyPromisePipelineV2,
    promiseLegacyPipelineObserve,
    promiseLegacyPipelineV2,
    promisePipelineV2,
} from "./index";

describe("PipelineV2 promise bridge", () => {
    it("should resolve sync direct-exec flows through a promise wrapper", async () => {
        const bridge = createLegacyPromisePipelineV2(
            {type: "number"},
            (input) => input + 1,
            {exec: (input) => input * 2},
        );

        await expect(bridge.promise(2)).resolves.toBe(6);
    });

    it("should resolve async stage flows", async () => {
        await expect(promiseLegacyPipelineV2(
            2,
            {type: "number"},
            async (input) => input + 1,
            {exec: (input) => input * 2},
        )).resolves.toBe(6);
    });

    it("should reject with the legacy error shape on validation failure", async () => {
        await expect(promiseLegacyPipelineV2(true, {type: "string"})).rejects.toMatchObject({
            data: true,
            error: expect.any(Array),
        });
    });

    it("should work directly against V2-compatible stage arrays", async () => {
        await expect(promisePipelineV2([
            {type: "number"},
            (input) => input + 1,
        ], 2)).resolves.toBe(3);
    });

    it("should preserve observer-backed promise behavior for legacy pipeline instances", async () => {
        const handlers = [];
        const pipeline = {
            subscribe(handler) {
                handlers.push(handler);
            },
            write(input) {
                handlers[0].next(input + 1);
            },
        };

        await expect(promiseLegacyPipelineObserve(pipeline, 2)).resolves.toBe(3);
    });

    it("should reject observer-backed promise behavior through the legacy error channel", async () => {
        const handlers = [];
        const pipeline = {
            subscribe(handler) {
                handlers.push(handler);
            },
            write(input) {
                handlers[0].error({
                    error: new Error("boom"),
                    data: input,
                });
            },
        };

        await expect(promiseLegacyPipelineObserve(pipeline, 2)).rejects.toMatchObject({
            error: expect.any(Error),
            data: 2,
        });
    });
});
