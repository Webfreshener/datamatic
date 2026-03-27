import {execLegacyPipelineWrite, writeLegacyPipelineResult} from "./write";

describe("PipelineV2 write compat helpers", () => {
    it("should commit sync values to the legacy out model", () => {
        const out = {model: null};

        writeLegacyPipelineResult({
            result: {value: 1},
            data: {input: true},
            out,
            writable: true,
            emitError: () => {},
        });

        expect(out.model).toEqual({value: 1});
    });

    it("should resolve promise results into the legacy out model", async () => {
        const out = {model: null};

        await execLegacyPipelineWrite({
            exec: () => Promise.resolve({value: 2}),
            data: {input: true},
            out,
            writable: true,
            emitError: () => {},
        });

        expect(out.model).toEqual({value: 2});
    });

    it("should report execution errors through the legacy error channel", () => {
        const errors = [];

        execLegacyPipelineWrite({
            exec: () => {
                throw new Error("boom");
            },
            data: {input: true},
            out: {model: null},
            writable: true,
            emitError: (error) => errors.push(error),
        });

        expect(errors).toEqual([
            {
                error: expect.objectContaining({message: "boom"}),
                data: {input: true},
            },
        ]);
    });

    it("should report commit errors through the legacy error channel", () => {
        const errors = [];
        const out = {
            set model(_) {
                throw new Error("bad commit");
            },
        };

        writeLegacyPipelineResult({
            result: {toJSON: () => ({value: 3})},
            data: {input: true},
            out,
            writable: true,
            emitError: (error) => errors.push(error),
        });

        expect(errors).toEqual([
            {
                error: expect.objectContaining({message: "bad commit"}),
                data: {input: true},
            },
        ]);
    });
});

