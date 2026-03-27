import {Pipeline} from "../Pipeline";
import {
    linkLegacyPipeline,
    mergeLegacyPipelines,
    normalizeLegacyLinkCallbacks,
    pipeLegacyPipeline,
    splitLegacyPipeline,
    unlinkLegacyPipeline,
} from "./orchestration";

describe("PipelineV2 orchestration compat helpers", () => {
    it("should normalize inline and array-wrapped link callbacks", () => {
        expect(normalizeLegacyLinkCallbacks([(d) => d])).toHaveLength(2);
        expect(normalizeLegacyLinkCallbacks([[(d) => d]])).toHaveLength(2);
    });

    it("should create pipe segments through the compat helper", () => {
        const source = new Pipeline((d) => ({value: d.value + 1}));
        const target = pipeLegacyPipeline({
            source,
            PipelineClass: Pipeline,
            pipesOrSchemas: [(d) => ({value: d.value * 2})],
        });

        source.write({value: 1});
        expect(target.tap()).toEqual({value: 4});
    });

    it("should link and unlink through the compat helper", async () => {
        const source = new Pipeline((d) => ({value: d.value}));
        const target = new Pipeline((d) => ({value: d.value}));
        const links = new WeakMap();

        linkLegacyPipeline({
            source,
            target,
            callbacks: [[(d) => ({value: d.value + 1})]],
            PipelineClass: Pipeline,
            links,
        });

        source.write({value: 1});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(target.tap()).toEqual({value: 2});

        unlinkLegacyPipeline({
            target,
            PipelineClass: Pipeline,
            links,
        });

        source.write({value: 2});
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(target.tap()).toEqual({value: 2});
    });

    it("should merge subscribe-capable pipes through the compat helper", () => {
        const listeners = [];
        const merged = mergeLegacyPipelines({
            listeners,
            pipeOrPipes: {
                subscribe(handler) {
                    handler({toJSON: () => ({value: 3})});
                },
            },
            PipelineClass: Pipeline,
        });

        expect(merged.output.tap()).toEqual({value: 3});
        expect(merged.listeners).toHaveLength(1);
    });

    it("should split into parallel pipe segments through the compat helper", () => {
        const source = new Pipeline((d) => ({value: d.value + 1}));
        const split = splitLegacyPipeline({
            source,
            schemasOrPipes: [
                (d) => ({value: d.value}),
                (d) => ({value: d.value + 2}),
            ],
            PipelineClass: Pipeline,
        });

        source.write({value: 1});
        expect(split).toHaveLength(2);
        expect(split[0].tap()).toEqual({value: 2});
        expect(split[1].tap()).toEqual({value: 4});
    });
});
