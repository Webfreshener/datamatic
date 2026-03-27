import {
    PipelineV2,
    PipelineV2StageError,
    createTransformStage,
    createValidatorStage,
} from "./index";

describe("PipelineV2", () => {
    it("should return input unchanged for an empty pipeline", async () => {
        const pipeline = new PipelineV2();
        const input = {ok: true};

        await expect(pipeline.run(input)).resolves.toBe(input);
    });

    it("should preserve deterministic stage order across sync and async stages", async () => {
        const events = [];
        const pipeline = new PipelineV2([
            createTransformStage((input, ctx) => {
                events.push(`${ctx.index}:${ctx.stage.name}`);
                return input + 1;
            }, {name: "increment"}),
            createTransformStage(async (input, ctx) => {
                events.push(`${ctx.index}:${ctx.stage.name}`);
                return input * 2;
            }, {name: "double"}),
            createTransformStage((input, ctx) => {
                events.push(`${ctx.index}:${ctx.stage.name}`);
                return input - 3;
            }, {name: "decrement"}),
        ]);

        await expect(pipeline.run(4)).resolves.toBe(7);
        expect(events).toEqual([
            "0:increment",
            "1:double",
            "2:decrement",
        ]);
    });

    it("should compose validator and transform stages", async () => {
        const pipeline = new PipelineV2([
            createValidatorStage((input) => Array.isArray(input), {name: "array-input"}),
            createTransformStage((input) => input.filter((item) => item.active), {name: "filter-active"}),
            createTransformStage((input) => input.map((item) => item.name), {name: "map-name"}),
        ]);

        await expect(pipeline.run([
            {name: "sam", active: true},
            {name: "alex", active: false},
            {name: "jo", active: true},
        ])).resolves.toEqual(["sam", "jo"]);
    });

    it("should reject invalid validator output with a typed stage error", async () => {
        const pipeline = new PipelineV2([
            createValidatorStage((input) => input === "ok", {name: "must-be-ok"}),
        ]);

        await expect(pipeline.run("nope")).rejects.toBeInstanceOf(PipelineV2StageError);
    });

    it("should reject stages that do not implement the V2 contract", () => {
        expect(() => new PipelineV2([
            () => "invalid",
        ])).toThrow("must implement run(input, ctx)");
    });
});
