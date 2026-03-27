import {Pipeline} from "../Pipeline";
import {Validator} from "../Validator";
import {basicCollection} from "../../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../../fixtures/pipes-test.data";
import {
    execLegacyPipelineV2,
    promiseLegacyPipelineV2,
    traceLegacyPipelineV2,
} from "./index";

describe("PipelineV2 parity", () => {
    const supportedDirectExecStages = [
        basicCollection,
        (records) => records.filter((record) => record.active),
    ];

    it("should match legacy direct exec output for the fixture pipeline", () => {
        const legacy = new Pipeline(...supportedDirectExecStages);
        const legacyResult = legacy.exec(data);
        const v2Result = execLegacyPipelineV2(data, ...supportedDirectExecStages);

        expect(v2Result).toEqual(legacyResult);
        expect(v2Result.then).toBeUndefined();
    });

    it("should match legacy validation failure shape for direct exec input errors", () => {
        const legacy = new Pipeline(...supportedDirectExecStages);

        try {
            legacy.exec("invalid value");
            throw new Error("expected legacy exec failure");
        } catch (legacyError) {
            try {
                execLegacyPipelineV2("invalid value", ...supportedDirectExecStages);
                throw new Error("expected V2 exec failure");
            } catch (v2Error) {
                expect(v2Error.data).toEqual(legacyError.data);
                expect(v2Error.error[0].message).toEqual(legacyError.error[0].message);
            }
        }
    });

    it("should match legacy downstream validation behavior for false-return stages", () => {
        const stages = [
            {type: "object"},
            (record) => record.active ? record : record,
            {
                exec: () => false,
            },
            {type: "array"},
        ];
        const input = data[0];
        const legacy = new Pipeline(...stages);

        try {
            legacy.exec(input);
            throw new Error("expected legacy downstream validation failure");
        } catch (legacyError) {
            try {
                execLegacyPipelineV2(input, ...stages);
                throw new Error("expected V2 downstream validation failure");
            } catch (v2Error) {
                expect(v2Error.data).toEqual(legacyError.data);
                expect(v2Error.error[0].message).toEqual(legacyError.error[0].message);
            }
        }
    });

    it("should match legacy async direct exec behavior", async () => {
        const stages = [
            {type: "number"},
            async (input) => input + 1,
            {exec: (input) => input * 2},
        ];
        const legacy = new Pipeline(...stages);
        const legacyResult = legacy.exec(2);
        const v2Result = execLegacyPipelineV2(2, ...stages);

        expect(legacyResult.then).toBeDefined();
        expect(v2Result.then).toBeDefined();
        await expect(v2Result).resolves.toEqual(await legacyResult);
    });

    it("should match legacy validator-instance coercion for direct exec", () => {
        const validator = new Validator(basicCollection);
        const legacy = new Pipeline(
            validator,
            (records) => records.filter((record) => record.active),
        );
        const legacyResult = legacy.exec(data);
        const v2Result = execLegacyPipelineV2(
            data,
            validator,
            (records) => records.filter((record) => record.active),
        );

        expect(v2Result).toEqual(legacyResult);
    });

    it("should provide a trace replacement that preserves legacy yield values", async () => {
        const stages = [
            {
                exec: () => "foo",
            },
            new Pipeline({
                exec: () => "bar",
            }),
            {
                exec: () => "baz",
            },
        ];
        const legacyValues = [];
        const generator = new Pipeline(...stages).yield(data);
        let next = generator.next();

        while (!next.done) {
            legacyValues.push(next.value);
            next = generator.next(next.value);
        }

        const traced = await traceLegacyPipelineV2(data, ...stages);
        expect(traced.trace.map((step) => step.output)).toEqual(legacyValues);
        expect(traced.output).toEqual(legacyValues[legacyValues.length - 1]);
    });

    it("should match legacy direct exec output for raw array-wrapped iterator stages", () => {
        const stages = [[
            (record) => record.active ? record : void 0,
        ]];
        const records = [
            {name: "sam", active: true},
            {name: "alex", active: false},
            {name: "jo", active: true},
        ];
        const legacy = new Pipeline(...stages);

        expect(execLegacyPipelineV2(records, ...stages)).toEqual(legacy.exec(records));
    });

    it("should match legacy promise resolution for supported direct-exec stages", async () => {
        const stages = [
            basicCollection,
            (records) => records.filter((record) => record.active),
        ];
        const legacy = new Pipeline(...stages);

        await expect(promiseLegacyPipelineV2(data, ...stages)).resolves.toEqual(
            await legacy.promise(data),
        );
    });

    it("should match legacy promise rejection shape for validation failures", async () => {
        const stages = [
            basicCollection,
            (records) => records.filter((record) => record.active),
        ];
        const legacy = new Pipeline(...stages);

        try {
            await legacy.promise("invalid value");
            throw new Error("expected legacy promise failure");
        } catch (legacyError) {
            await expect(promiseLegacyPipelineV2("invalid value", ...stages)).rejects.toMatchObject({
                data: legacyError.data,
                error: expect.any(Array),
            });
        }
    });
});
