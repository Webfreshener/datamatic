import {Pipeline} from "../../Pipeline";

export const createLegacyModelPipeline = (model, ...pipesOrSchemas) => {
    const pipeline = new Pipeline(...pipesOrSchemas);
    const subscription = model.subscribe({
        next: (value) => {
            pipeline.write(value);
        },
        complete: () => {
            subscription.unsubscribe();
            pipeline.close();
        }
    });

    return pipeline;
};
