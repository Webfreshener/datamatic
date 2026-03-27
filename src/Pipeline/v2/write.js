export const writeLegacyPipelineResult = ({result, data, out, writable, emitError}) => {
    const commit = (value) => {
        try {
            out.model = value && value.toJSON ? value.toJSON() : value;
        } catch (error) {
            emitError({
                error,
                data,
            });
        }
    };

    const type = typeof result;
    if ((result instanceof Promise) || (((type === "function") || (type === "object")) && writable)) {
        if (result instanceof Promise) {
            return result.then((value) => {
                commit(value);
            }).catch((error) => {
                emitError({
                    error,
                    data,
                });
            });
        }

        if (type === "function") {
            const next = result();
            if (next instanceof Promise) {
                return next.then((value) => {
                    commit(value);
                }).catch((error) => {
                    emitError({
                        error,
                        data,
                    });
                });
            }
        }
    }

    commit(result);
    return result;
};

export const execLegacyPipelineWrite = ({exec, data, out, writable, emitError}) => {
    let result;

    try {
        result = exec(data);
    } catch (error) {
        return emitError({
            error,
            data,
        });
    }

    return writeLegacyPipelineResult({
        result,
        data,
        out,
        writable,
        emitError,
    });
};

