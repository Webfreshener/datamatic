export const basicModel = {
    type: "object",
    properties: {
        name: {
            type: "string",
        },
        age: {
            type: "number",
        },
        active: {
            type: "boolean",
        },
    },
};

export const nestedModel = {
    "properties": {
        "aObject": {
            "type": "object",
            "properties": {
                "bObject": {
                    "type": "object",
                    "properties": {
                        "bValue": {
                            "type": "integer",
                        },
                    },
                    "required": ["bValue"],
                },
            },
            "required": ["bObject"],
        },
    },
    "required": ["aObject"],
};
