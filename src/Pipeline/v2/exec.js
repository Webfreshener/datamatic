import {buildStageSummary, isPromiseLike, toPipelineV2} from "./helpers";

const wrapLegacyExecError = (error, input) => (
    error && error.error !== void 0 && error.data !== void 0 ? error : {
        error,
        data: input,
    }
);

const runRemainingStages = (pipeline, startIndex, current, input, ctx) => {
    let value = current;

    for (let index = startIndex; index < pipeline.stages.length; index++) {
        const stage = pipeline.stages[index];
        const summary = buildStageSummary(stage, index);
        const stageCtx = {
            ...ctx,
            index,
            stage,
            totalStages: pipeline.stages.length,
            pipeline,
        };

        try {
            const result = stage.run(value, stageCtx);

            if (isPromiseLike(result)) {
                return result
                    .then((resolved) => runRemainingStages(pipeline, index + 1, resolved, input, ctx))
                    .catch((error) => Promise.reject(wrapLegacyExecError(error, input)));
            }

            value = result;
        } catch (error) {
            throw wrapLegacyExecError(error, input);
        }
    }

    return value;
};

export const execPipelineV2 = (pipelineOrStages, input, ctx = {}) => {
    const pipeline = toPipelineV2(
        pipelineOrStages,
        "PipelineV2 exec helpers require a PipelineV2 instance or stage array",
    );

    return runRemainingStages(pipeline, 0, input, input, ctx);
};

export const execLegacyPipelineV2 = (input, ...stages) => execPipelineV2(stages, input);

export const createLegacyExecPipelineV2 = (...stages) => {
    const pipeline = toPipelineV2(
        stages,
        "PipelineV2 exec helpers require a PipelineV2 instance or stage array",
    );

    return Object.freeze({
        pipeline,
        exec(input, ctx = {}) {
            return execPipelineV2(pipeline, input, ctx);
        },
    });
};

