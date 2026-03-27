export const getLegacyYieldCallbacks = (pipesOrSchemas) => {
    const callbacks = pipesOrSchemas.map((stage) => stage.exec || ((value) => value));

    if (!callbacks.length) {
        callbacks[0] = (value) => value;
    }

    return callbacks;
};

export const yieldLegacyPipeline = ({scope, pipesOrSchemas, input, emitError}) => {
    const callbacks = getLegacyYieldCallbacks(pipesOrSchemas);

    return (function* legacyYield(data) {
        try {
            for (const callback of callbacks) {
                data = yield callback.call(scope, data);
            }
        } catch (error) {
            emitError(error);
        }
    }).call(scope, input);
};
