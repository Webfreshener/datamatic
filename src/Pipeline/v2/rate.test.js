import {
    clearLegacyPipelineInterval,
    sampleLegacyPipeline,
    throttleLegacyPipeline,
    unthrottleLegacyPipeline,
} from "./rate";

describe("PipelineV2 rate compat helpers", () => {
    it("should throttle by scheduling queued execution against output state", () => {
        const pipe = {};
        const props = {tO: 3};
        const cache = [() => 2, "not-fn"];
        const out = {model: 0};
        const cleared = [];
        let tick;

        const result = throttleLegacyPipeline({
            pipe,
            rate: 5,
            props,
            cache,
            out,
            unthrottle: jest.fn(),
            setIntervalImpl: (fn) => {
                tick = fn;
                return 7;
            },
            clearIntervalImpl: (value) => {
                cleared.push(value);
            },
        });

        expect(result).toBe(pipe);
        expect(cleared).toEqual([3]);
        expect(props.tO).toBe(7);

        tick();
        expect(out.model).toBe(2);
        tick();
        expect(out.model).toBe(2);
    });

    it("should delegate non-positive throttle calls to unthrottle semantics", () => {
        const unthrottle = jest.fn();

        throttleLegacyPipeline({
            pipe: {},
            rate: 0,
            props: {},
            cache: [],
            out: {},
            unthrottle,
        });
        throttleLegacyPipeline({
            pipe: {},
            rate: -1,
            props: {},
            cache: [],
            out: {},
            unthrottle,
        });

        expect(unthrottle).toHaveBeenNthCalledWith(1);
        expect(unthrottle).toHaveBeenNthCalledWith(2, true);
    });

    it("should flush or discard queued functions during unthrottle", () => {
        const cleared = [];
        const props = {tO: 9};
        const flushedCache = [() => 4, "not-fn", () => 6];
        const out = {model: 0};

        unthrottleLegacyPipeline({
            props,
            cache: flushedCache,
            out,
            clearIntervalImpl: (value) => {
                cleared.push(value);
            },
        });

        expect(cleared).toEqual([9]);
        expect(out.model).toBe(4);
        expect(flushedCache).toHaveLength(1);
        expect(typeof flushedCache[0]).toBe("function");

        const discardCache = [() => 1, () => 2];
        unthrottleLegacyPipeline({
            props: {},
            cache: discardCache,
            out,
            discardCacheQueue: true,
        });
        expect(discardCache).toEqual([]);
    });

    it("should set sample interval and return the original pipe", () => {
        const pipe = {};
        const props = {ivl: 0};

        expect(sampleLegacyPipeline({pipe, props, nth: 3})).toBe(pipe);
        expect(props.ivl).toBe(3);
    });

    it("should clear an active interval when present", () => {
        const cleared = [];
        clearLegacyPipelineInterval({
            props: {tO: 11},
            clearIntervalImpl: (value) => {
                cleared.push(value);
            },
        });
        clearLegacyPipelineInterval({
            props: {},
            clearIntervalImpl: (value) => {
                cleared.push(value);
            },
        });

        expect(cleared).toEqual([11]);
    });
});
