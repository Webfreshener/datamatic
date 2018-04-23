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
    "type": "object",
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

export const nestedModelDefault = {
    "type": "object",
    "properties": {
        "aObject": {
            "type": "object",
            "properties": {
                "bObject": {
                    "type": "object",
                    "properties": {
                        "bValue": {
                            "type": "integer",
                            "default": 123,
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


export const scoresModel = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
        },
        "topScores": {
            "type": "array",
            "minItems": 1,
            "maxItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "score": {
                        "type": "integer",
                        "default": 0
                    }
                },
                "required": ["name"]
            }
        }
    },
    required: ["name", "topScores"],
};
