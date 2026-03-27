import {Pipeline} from "../Pipeline";
import {cloneLegacyPipeline} from "./clone";

describe("PipelineV2 clone compat helper", () => {
    it("should preserve shared output state between original and clone", () => {
        const source = new Pipeline((d) => ({value: d.value + 1}));
        const clone = source.clone();

        clone.write({value: 1});

        expect(source.tap()).toEqual({value: 2});
        expect(clone.tap()).toEqual({value: 2});
    });

    it("should preserve shared writable state between original and clone", () => {
        const source = new Pipeline((d) => d + 1);
        const clone = source.clone();

        clone.close();

        expect(source.writable).toBe(false);
        expect(clone.writable).toBe(false);
    });

    it("should expose the legacy clone helper shape directly", () => {
        const pipes = new WeakMap();
        const sharedProps = {listeners: [{name: "listener"}]};
        const originalListeners = sharedProps.listeners;
        const source = {};
        pipes.set(source, sharedProps);

        class FakePipeline {
            constructor() {
                pipes.set(this, {listeners: []});
            }
        }

        const clone = cloneLegacyPipeline({
            source,
            PipelineClass: FakePipeline,
            pipes,
        });

        expect(pipes.get(clone)).toBe(sharedProps);
        expect(pipes.get(clone).listeners).toEqual([{name: "listener"}]);
        expect(pipes.get(clone).listeners).not.toBe(originalListeners);
    });
});
