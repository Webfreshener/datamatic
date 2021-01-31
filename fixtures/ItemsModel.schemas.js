export const stringsCollection = {
    $id: "root",
    type: "array",
    items: {
        type: "string",
    },
};

export const stringsMinMaxCollection = {
    $id: "root",
    type: "array",
    minItems: 1,
    maxItems: 3,
    items: {
        type: "string",
    },
};

export const objectCollection = {
    $id: "root",
    type: "array",
    items: {
        type: "object",
        properties: {
            name: {
                type: "string",
            },
            value: {
                type: "number",
            },
        },
        required: ["name"],
    },
};

export const objectCollectionDefaults = {
    $id: "root",
    type: "array",
    items: {
        type: "object",
        properties: {
            name: {
                type: "string",
                default: "abc"
            },
            value: {
                type: "number",
            },
        },
        required: ["name"],
    },
};
