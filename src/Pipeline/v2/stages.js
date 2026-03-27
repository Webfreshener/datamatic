import {isPromiseLike} from "./helpers";

const assertStageFunction = (value, label) => {
    if (!(value instanceof Function)) {
        throw new TypeError(`PipelineV2 ${label} must be a function`);
    }
};

const buildStage = (kind, name, run) => Object.freeze({
    kind,
    name,
    run,
});

export class PipelineV2StageError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "PipelineV2StageError";
        this.details = details;
    }
}

export const createTransformStage = (transform, options = {}) => {
    assertStageFunction(transform, "transform");

    return buildStage(
        "transform",
        options.name || transform.name || "transform",
        (input, ctx) => transform(input, ctx),
    );
};

export const createValidatorStage = (validate, options = {}) => {
    assertStageFunction(validate, "validator");

    const stageName = options.name || validate.name || "validator";
    const finalize = (result, input) => {
        if (result === false) {
            throw new PipelineV2StageError(
                options.message || "PipelineV2 validation stage failed",
                {input, stage: stageName},
            );
        }

        return input;
    };

    return buildStage(
        "validator",
        stageName,
        (input, ctx) => {
            const result = validate(input, ctx);
            return isPromiseLike(result) ? result.then((resolved) => finalize(resolved, input)) : finalize(result, input);
        },
    );
};
