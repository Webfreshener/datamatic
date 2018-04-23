export const stringsCollection = {
    type: "array",
    items: {
        type: "string",
    },
};

export const stringsMinMaxCollection = {
    type: "array",
    minItems: 1,
    maxItems: 3,
    items: {
        type: "string",
    },
};

export const objectCollection = {
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
