import {PipelineV2} from "./PipelineV2";
import {adaptLegacyStages} from "./adapters";

export const isPromiseLike = (value) => Boolean(value && value.then instanceof Function);

export const toPipelineV2 = (pipelineOrStages, message = "PipelineV2 helpers require a PipelineV2 instance or stage array") => {
    if (pipelineOrStages instanceof PipelineV2) {
        return pipelineOrStages;
    }

    if (Array.isArray(pipelineOrStages)) {
        return new PipelineV2(adaptLegacyStages(pipelineOrStages));
    }

    throw new TypeError(message);
};

export const buildStageSummary = (stage, index) => ({
    index,
    kind: stage.kind || "stage",
    name: stage.name || `stage-${index}`,
});

