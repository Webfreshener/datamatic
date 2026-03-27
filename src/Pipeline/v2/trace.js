import {buildStageSummary, toPipelineV2} from "./helpers";

export class PipelineV2TraceError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "PipelineV2TraceError";
        this.details = details;
    }
}

export const describePipelineV2 = (pipelineOrStages) => {
    const pipeline = toPipelineV2(
        pipelineOrStages,
        "PipelineV2 trace helpers require a PipelineV2 instance or stage array",
    );
    return pipeline.stages.map((stage, index) => buildStageSummary(stage, index));
};

export const tracePipelineV2 = async (pipelineOrStages, input, ctx = {}) => {
    const pipeline = toPipelineV2(
        pipelineOrStages,
        "PipelineV2 trace helpers require a PipelineV2 instance or stage array",
    );
    const trace = [];
    let current = input;

    for (let index = 0; index < pipeline.stages.length; index++) {
        const stage = pipeline.stages[index];
        const summary = buildStageSummary(stage, index);
        const stageCtx = {
            ...ctx,
            index,
            stage,
            totalStages: pipeline.stages.length,
            pipeline,
            trace,
        };

        try {
            const output = await stage.run(current, stageCtx);
            trace.push({
                ...summary,
                input: current,
                output,
            });
            current = output;
        } catch (error) {
            throw new PipelineV2TraceError("PipelineV2 trace failed", {
                error,
                failedStage: summary,
                input: current,
                trace,
            });
        }
    }

    return {
        output: current,
        trace,
    };
};

export const traceLegacyPipelineV2 = async (input, ...stages) => {
    return tracePipelineV2(stages, input);
};

