import {
    PipelineV2,
    PipelineV2TraceError,
    createTransformStage,
    describePipelineV2,
    traceLegacyPipelineV2,
    tracePipelineV2,
} from "./index";

describe("PipelineV2 trace helpers", () => {
    it("should describe stages without executing them", () => {
        const pipeline = new PipelineV2([
            createTransformStage((input) => input + 1, {name: "increment"}),
            createTransformStage((input) => input * 2, {name: "double"}),
        ]);

        expect(describePipelineV2(pipeline)).toEqual([
            {index: 0, kind: "transform", name: "increment"},
            {index: 1, kind: "transform", name: "double"},
        ]);
    });

    it("should trace sync and async stage output in order", async () => {
        const pipeline = new PipelineV2([
            createTransformStage((input) => input + 1, {name: "increment"}),
            createTransformStage(async (input) => input * 2, {name: "double"}),
        ]);

        await expect(tracePipelineV2(pipeline, 2)).resolves.toEqual({
            output: 6,
            trace: [
                {index: 0, kind: "transform", name: "increment", input: 2, output: 3},
                {index: 1, kind: "transform", name: "double", input: 3, output: 6},
            ],
        });
    });

    it("should trace adapted legacy stages without runtime code generation", async () => {
        const result = await traceLegacyPipelineV2(
            "ok",
            {type: "string"},
            (input) => `${input}!`,
            {exec: (input) => input.toUpperCase()},
        );

        expect(result.output).toBe("OK!");
        expect(result.trace.map((step) => step.name)).toEqual([
            "legacy-stage-0",
            "legacy-stage-1",
            "legacy-stage-2",
        ]);
    });

    it("should capture partial trace on failure", async () => {
        const pipeline = new PipelineV2([
            createTransformStage((input) => input + 1, {name: "increment"}),
            createTransformStage(() => {
                throw new Error("boom");
            }, {name: "explode"}),
        ]);

        await expect(tracePipelineV2(pipeline, 1)).rejects.toMatchObject({
            name: "PipelineV2TraceError",
            details: {
                failedStage: {index: 1, kind: "transform", name: "explode"},
                input: 2,
                trace: [
                    {index: 0, kind: "transform", name: "increment", input: 1, output: 2},
                ],
            },
        });
    });

    it("should reject unsupported trace inputs", () => {
        expect(() => describePipelineV2({bogus: true})).toThrow(
            "PipelineV2 trace helpers require a PipelineV2 instance or stage array",
        );
    });

    it("should expose the wrapped error on trace failure", async () => {
        const pipeline = new PipelineV2([
            createTransformStage(() => {
                throw new Error("boom");
            }, {name: "explode"}),
        ]);

        try {
            await tracePipelineV2(pipeline, 1);
            throw new Error("expected trace failure");
        } catch (error) {
            expect(error).toBeInstanceOf(PipelineV2TraceError);
            expect(error.details.error.message).toBe("boom");
        }
    });
});
