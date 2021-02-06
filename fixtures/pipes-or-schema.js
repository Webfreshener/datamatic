import {basicCollection} from "./PropertiesModel.schemas";

// represents a basic Pipe workflow signature
export default [
    basicCollection,
    [(d) => d.active ? d : undefined],
];
