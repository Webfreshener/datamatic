import {
    PipelineV2,
    createLegacyExecPipelineV2,
    createTransformStage,
    execLegacyPipelineV2,
    execPipelineV2,
} from "./index";

describe("PipelineV2 exec bridge", () => {
    it("should preserve sync direct-exec behavior for sync stages", () => {
        const bridge = createLegacyExecPipelineV2(
            {type: "number"},
            (input) => input + 1,
            {exec: (input) => input * 2},
        );

        const result = bridge.exec(2);

        expect(result).toBe(6);
        expect(result.then).toBeUndefined();
    });

    it("should return a promise when the adapted stage flow is async", async () => {
        const result = execLegacyPipelineV2(
            2,
            (input) => input + 1,
            async (input) => input * 2,
        );

        expect(result.then).toBeDefined();
        await expect(result).resolves.toBe(6);
    });

    it("should wrap validation errors in the legacy exec error shape", () => {
        try {
            execLegacyPipelineV2(true, {type: "string"});
            throw new Error("expected validation failure");
        } catch (error) {
            expect(error.data).toBe(true);
            expect(error.error[0].message).toBe("must be string");
        }
    });

    it("should preserve original input when downstream validation fails", () => {
        try {
            execLegacyPipelineV2(
                {value: "original"},
                {exec: () => false},
                {type: "array"},
            );
            throw new Error("expected downstream validation failure");
        } catch (error) {
            expect(error.data).toEqual({value: "original"});
            expect(error.error[0].message).toBe("must be array");
        }
    });

    it("should reject async failures with the legacy exec error shape", async () => {
        const result = execLegacyPipelineV2(
            "ok",
            async () => {
                throw new Error("boom");
            },
        );

        await expect(result).rejects.toMatchObject({
            data: "ok",
            error: expect.objectContaining({message: "boom"}),
        });
    });

    it("should execute directly against a PipelineV2 instance", () => {
        const pipeline = new PipelineV2([
            createTransformStage((input) => input + 1, {name: "increment"}),
        ]);

        expect(execPipelineV2(pipeline, 1)).toBe(2);
    });
});
