const normalizeStages = (stages = []) => {
    if (!Array.isArray(stages)) {
        throw new TypeError("PipelineV2 requires an array of stages");
    }

    return stages.map((stage, index) => {
        if (!stage || !(stage.run instanceof Function)) {
            throw new TypeError(
                `PipelineV2 stage at index ${index} must implement run(input, ctx)`,
            );
        }

        return Object.freeze({
            kind: stage.kind || "stage",
            name: stage.name || `stage-${index}`,
            run: stage.run,
        });
    });
};

export class PipelineV2 {
    constructor(stages = []) {
        this._stages = normalizeStages(stages);
    }

    get stages() {
        return [...this._stages];
    }

    async run(input, ctx = {}) {
        let current = input;
        const pipeline = this;
        const totalStages = this._stages.length;

        for (let index = 0; index < totalStages; index++) {
            const stage = this._stages[index];
            current = await stage.run(current, {
                ...ctx,
                index,
                stage,
                totalStages,
                pipeline,
            });
        }

        return current;
    }
}

