import {basicCollection} from "./PropertiesModel.schemas";

// represents a basic TxPipe workflow signature
export default [
    basicCollection,
    [(d) => d.active ? d : undefined],
];
