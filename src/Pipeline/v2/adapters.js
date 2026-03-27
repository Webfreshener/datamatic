import {Iterator} from "../Iterator";
import {Validator} from "../Validator";
import {PipelineV2} from "./PipelineV2";
import {createTransformStage, createValidatorStage} from "./stages";

const schemaLikeKeys = [
    "$id",
    "$ref",
    "$schema",
    "allOf",
    "anyOf",
    "definitions",
    "items",
    "oneOf",
    "properties",
    "required",
    "schema",
    "schemas",
    "type",
    "use",
];

const isSchemaLike = (value) => Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    schemaLikeKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key)),
);

const isPromiseLike = (value) => Boolean(value && value.then instanceof Function);

const normalizeIteratorStageItems = (stages = []) => stages.map((stage) => (
    isSchemaLike(stage) && Validator.validateSchemas(stage) ? new Validator(stage) : stage
));

const getIteratorStages = (stageLike) => {
    if (Array.isArray(stageLike)) {
        return normalizeIteratorStageItems(stageLike);
    }

    if (stageLike instanceof Iterator) {
        return normalizeIteratorStageItems(stageLike.stages);
    }

    if (
        stageLike &&
        typeof stageLike === "object" &&
        !(stageLike instanceof Iterator) &&
        stageLike.loop &&
        stageLike[Symbol.iterator] instanceof Function
    ) {
        return normalizeIteratorStageItems([...stageLike]);
    }

    return null;
};

const runAdaptedStages = (pipeline, input, ctx = {}) => {
    const totalStages = pipeline.stages.length;

    const step = (index, current) => {
        for (let stageIndex = index; stageIndex < totalStages; stageIndex++) {
            const stage = pipeline.stages[stageIndex];
            const result = stage.run(current, {
                ...ctx,
                index: stageIndex,
                stage,
                totalStages,
                pipeline,
            });

            if (isPromiseLike(result)) {
                return result.then((resolved) => step(stageIndex + 1, resolved));
            }

            current = result;
        }

        return current;
    };

    return step(0, input);
};

const toIteratorStage = (stages, options = {}) => {
    const iteratorPipeline = new PipelineV2(adaptLegacyStages(stages));
    const stageName = options.name || "legacy-iterator";

    return createTransformStage((records) => {
        if (!Array.isArray(records)) {
            throw {
                error: {
                    message: "iterators accept iterable values only",
                },
                data: records,
            };
        }

        const values = [];
        const pending = [];

        records.forEach((record, recordIndex) => {
            try {
                const result = runAdaptedStages(iteratorPipeline, record, {
                    iterator: true,
                    recordIndex,
                });

                if (isPromiseLike(result)) {
                    pending.push(
                        result
                            .then((resolved) => ({recordIndex, resolved}))
                            .catch(() => ({recordIndex, resolved: void 0})),
                    );
                } else {
                    values[recordIndex] = result;
                }
            } catch (error) {
                values[recordIndex] = void 0;
            }
        });

        if (!pending.length) {
            return values.filter((value) => value !== void 0);
        }

        return Promise.all(pending).then((resolved) => {
            resolved.forEach(({recordIndex, resolved: value}) => {
                values[recordIndex] = value;
            });

            return values.filter((value) => value !== void 0);
        });
    }, {name: stageName});
};

const toValidatorStage = (validator, options = {}) => createValidatorStage(
    (input) => {
        const result = validator.validate(input);

        if (result === false && validator.errors) {
            throw validator.errors;
        }

        return result;
    },
    options,
);

export const adaptLegacyStage = (stageLike, options = {}) => {
    if (stageLike && stageLike.run instanceof Function) {
        return stageLike;
    }

    const iteratorStages = getIteratorStages(stageLike);
    if (iteratorStages) {
        return toIteratorStage(iteratorStages, {
            name: options.name || "legacy-iterator",
        });
    }

    if (stageLike instanceof Function) {
        return createTransformStage(stageLike, options);
    }

    if (stageLike instanceof Validator) {
        return toValidatorStage(stageLike, {
            name: options.name || "validator-instance",
        });
    }

    if (isSchemaLike(stageLike) && Validator.validateSchemas(stageLike)) {
        return toValidatorStage(new Validator(stageLike), {
            name: options.name || "schema-validator",
        });
    }

    if (stageLike && stageLike.exec instanceof Function) {
        return createTransformStage(
            (input, ctx) => stageLike.exec(input, ctx),
            {name: options.name || stageLike.name || "legacy-exec"},
        );
    }

    if (stageLike && stageLike.validate instanceof Function) {
        return createValidatorStage(
            (input, ctx) => {
                const result = stageLike.validate(input, ctx);
                if (result === false && stageLike.errors) {
                    throw stageLike.errors;
                }
                return result;
            },
            {name: options.name || stageLike.name || "legacy-validator"},
        );
    }

    throw new TypeError("Unable to adapt legacy pipeline stage into PipelineV2");
};

export const adaptLegacyStages = (stages = []) => {
    if (!Array.isArray(stages)) {
        throw new TypeError("PipelineV2 legacy adapters require an array of stages");
    }

    return stages.map((stageLike, index) => adaptLegacyStage(stageLike, {
        name: `legacy-stage-${index}`,
    }));
};

export const createLegacyPipelineV2 = (...stages) => new PipelineV2(adaptLegacyStages(stages));
