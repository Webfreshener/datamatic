import {basicCollection} from "./PropertiesModel.schemas";

// represents a basic Pipeline workflow signature
export default [
    basicCollection,
    [(d) => d.active ? d : undefined],
];
