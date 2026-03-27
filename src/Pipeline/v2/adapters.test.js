import {Iterator} from "../Iterator";
import {Validator} from "../Validator";
import {
    PipelineV2StageError,
    createTransformStage,
    adaptLegacyStage,
    adaptLegacyStages,
    createLegacyPipelineV2,
} from "./index";

const stringSchema = {
    $id: "pipeline-v2-adapter-test/string#",
    type: "string",
};

describe("PipelineV2 legacy adapters", () => {
    it("should adapt function stages into V2 transform stages", async () => {
        const pipeline = createLegacyPipelineV2(
            (input) => input + 1,
            (input) => input * 2,
        );

        await expect(pipeline.run(3)).resolves.toBe(8);
    });

    it("should adapt schema inputs into validator stages", async () => {
        const pipeline = createLegacyPipelineV2(stringSchema);

        await expect(pipeline.run("ok")).resolves.toBe("ok");
        await expect(pipeline.run(true)).rejects.toBeTruthy();
    });

    it("should adapt Validator instances into validator stages", async () => {
        const validator = new Validator(stringSchema);
        const stage = adaptLegacyStage(validator);

        expect(stage.run("ok", {})).toBe("ok");
        expect(() => stage.run(false, {})).toThrow();
    });

    it("should adapt exec objects into transform stages", async () => {
        const pipeline = createLegacyPipelineV2({
            exec: (input) => ({value: input, ok: true}),
        });

        await expect(pipeline.run("hello")).resolves.toEqual({value: "hello", ok: true});
    });

    it("should preserve already normalized V2 stages", () => {
        const stage = createTransformStage((input) => input);
        const stages = adaptLegacyStages([stage]);

        expect(stages[0]).toBe(stage);
    });

    it("should adapt array-wrapped iterator stages", async () => {
        const pipeline = createLegacyPipelineV2([
            (record) => record.active ? record : void 0,
        ]);

        await expect(pipeline.run([
            {name: "sam", active: true},
            {name: "alex", active: false},
            {name: "jo", active: true},
        ])).resolves.toEqual([
            {name: "sam", active: true},
            {name: "jo", active: true},
        ]);
    });

    it("should adapt Iterator instances without using legacy yield wiring directly", async () => {
        const pipeline = createLegacyPipelineV2(
            new Iterator((record) => record.active ? record : void 0),
        );

        await expect(pipeline.run([
            {name: "sam", active: true},
            {name: "alex", active: false},
        ])).resolves.toEqual([
            {name: "sam", active: true},
        ]);
    });

    it("should adapt loop-marked iterable stage objects", async () => {
        const iterableStage = {
            loop: true,
            *[Symbol.iterator]() {
                yield (record) => record.active ? record : void 0;
            },
        };
        const pipeline = createLegacyPipelineV2(iterableStage);

        await expect(pipeline.run([
            {name: "sam", active: true},
            {name: "alex", active: false},
        ])).resolves.toEqual([
            {name: "sam", active: true},
        ]);
    });

    it("should reject unknown legacy stage shapes", () => {
        expect(() => adaptLegacyStage({bogus: true})).toThrow(
            "Unable to adapt legacy pipeline stage into PipelineV2",
        );
    });

    it("should propagate validator-style false results without inventing coercion in core", async () => {
        const state = {errors: null};
        const pipeline = createLegacyPipelineV2({
            validate: (input) => {
                state.errors = input === "ok" ? null : [{message: "must equal ok"}];
                return input === "ok";
            },
            get errors() {
                return state.errors;
            },
        });

        await expect(pipeline.run("ok")).resolves.toBe("ok");
        await expect(pipeline.run("nope")).rejects.toEqual([{message: "must equal ok"}]);
    });

    it("should still use typed stage errors when a validator returns false without errors", async () => {
        const pipeline = createLegacyPipelineV2({
            validate: (input) => input === "ok",
        });

        await expect(pipeline.run("nope")).rejects.toBeInstanceOf(PipelineV2StageError);
    });
});
