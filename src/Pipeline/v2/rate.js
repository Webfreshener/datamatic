export const clearLegacyPipelineInterval = ({props, clearIntervalImpl = clearInterval}) => {
    const interval = props.tO;
    if (interval) {
        clearIntervalImpl(interval);
    }
};

export const flushLegacyPipelineCache = ({cache, out}) => {
    cache.forEach(() => {
        const next = cache.splice(0, 1);
        if ((typeof next[0]) === "function") {
            out.model = next[0]();
        }
    });
};

export const throttleLegacyPipeline = ({
    pipe,
    rate,
    props,
    cache,
    out,
    unthrottle,
    setIntervalImpl = setInterval,
    clearIntervalImpl = clearInterval,
}) => {
    if (rate > 0) {
        clearLegacyPipelineInterval({
            props,
            clearIntervalImpl,
        });

        const interval = setIntervalImpl(() => {
            if (cache.length) {
                const next = cache.splice(0, 1);
                if ((typeof next[0]) === "function") {
                    out.model = next[0]();
                }
            }
        }, parseInt(rate, 10));

        Object.assign(props, {tO: interval});
    } else if (rate === -1) {
        unthrottle(true);
    } else {
        unthrottle();
    }

    return pipe;
};

export const unthrottleLegacyPipeline = ({
    props,
    cache,
    out,
    discardCacheQueue = false,
    clearIntervalImpl = clearInterval,
}) => {
    clearLegacyPipelineInterval({
        props,
        clearIntervalImpl,
    });

    if (!discardCacheQueue) {
        flushLegacyPipelineCache({
            cache,
            out,
        });
    } else {
        cache.splice(0, cache.length);
    }
};

export const sampleLegacyPipeline = ({pipe, props, nth}) => {
    props.ivl = nth;
    return pipe;
};
