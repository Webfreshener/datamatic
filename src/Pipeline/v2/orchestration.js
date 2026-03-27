import {Executor} from "../Executor";
import {fill} from "../Utils";
import {default as DefaultVOSchema} from "../../schemas/default-pipe-vo.schema";

const assertLegacyPipelineTarget = (PipelineClass, target) => {
    if (!(target instanceof PipelineClass)) {
        throw `item for "target" was not a Pipe`;
    }
};

export const pipeLegacyPipeline = ({source, PipelineClass, pipesOrSchemas}) => {
    const target = new PipelineClass(...pipesOrSchemas);
    source.subscribe({
        next: (data) => {
            target.write(data);
        },
    });

    return target;
};

export const splitLegacyPipeline = ({source, schemasOrPipes, PipelineClass}) => (
    schemasOrPipes.map((item) => pipeLegacyPipeline({
        source,
        PipelineClass,
        pipesOrSchemas: [item],
    }))
);

export const normalizeLegacyLinkCallbacks = (callbacks) => {
    if (Array.isArray(callbacks[0])) {
        callbacks = callbacks[0];
    }

    return fill(callbacks);
};

export const unlinkLegacyPipeline = ({target, PipelineClass, links}) => {
    assertLegacyPipelineTarget(PipelineClass, target);

    const subscription = links.get(target);
    if (subscription) {
        subscription.unsubscribe();
        links.delete(target);
    }
};

export const linkLegacyPipeline = ({source, target, callbacks, PipelineClass, links}) => {
    assertLegacyPipelineTarget(PipelineClass, target);

    const subscription = source.subscribe({
        next: (data) => {
            const result = Executor.exec(
                normalizeLegacyLinkCallbacks(callbacks),
                data && data.toJSON ? data.toJSON() : data,
            );

            if (result instanceof Promise) {
                return result.then((value) => target.write(value));
            }

            target.write(result);
        },
        error: (error) => {
            console.error(error);
        },
        complete: () => unlinkLegacyPipeline({target, PipelineClass, links}),
    });

    links.set(target, subscription);
    return source;
};

export const mergeLegacyPipelines = ({
    listeners,
    pipeOrPipes,
    pipeOrSchema = {schemas: [DefaultVOSchema]},
    PipelineClass,
}) => {
    const output = new PipelineClass(pipeOrSchema);

    const mergedListeners = [
        ...listeners,
        ...(Array.isArray(pipeOrPipes) ? pipeOrPipes : [pipeOrPipes])
            .filter((pipe) => ((typeof pipe.subscribe) === "function"))
            .map((pipe) => {
                pipe.subscribe((data) => {
                    output.write(data && data.toJSON ? data.toJSON() : data);
                });
                return pipe;
            }),
    ];

    return {
        output,
        listeners: mergedListeners,
    };
};
