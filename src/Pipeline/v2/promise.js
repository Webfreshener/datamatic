import {createLegacyExecPipelineV2, execPipelineV2} from "./exec";

export const promisePipelineV2 = (pipelineOrStages, input, ctx = {}) => (
    Promise.resolve().then(() => execPipelineV2(pipelineOrStages, input, ctx))
);

export const promiseLegacyPipelineObserve = (pipeline, input) => (
    new Promise((resolve, reject) => {
        pipeline.subscribe({
            next: (value) => {
                resolve(value);
            },
            error: (error) => {
                reject(error);
            },
        });
        pipeline.write(input);
    })
);

export const promiseLegacyPipelineV2 = (input, ...stages) => (
    promisePipelineV2(stages, input)
);

export const createLegacyPromisePipelineV2 = (...stages) => {
    const bridge = createLegacyExecPipelineV2(...stages);

    return Object.freeze({
        pipeline: bridge.pipeline,
        promise(input, ctx = {}) {
            return promisePipelineV2(bridge.pipeline, input, ctx);
        },
    });
};
