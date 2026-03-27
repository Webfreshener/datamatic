export const cloneLegacyPipeline = ({source, PipelineClass, pipes}) => {
    const sharedProps = pipes.get(source);

    const CloneClass = class extends PipelineClass {
        constructor() {
            super();
            pipes.set(this, sharedProps);
            pipes.get(this).listeners = [...sharedProps.listeners];
        }
    };

    return new CloneClass();
};
