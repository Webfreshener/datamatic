export const basicModel = {
    $id: "root#",
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

export const basicCollection = {
    $id: "root#",
    type: "array",
    items: {
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
    },
};

export const nestedModel = {
    $id: "root#",
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
    $id: "root#",
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
    $id: "root#",
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

export const patternModel = {
    $id: "root#",
    type: "object",
    properties: {
        name: {
            type: "string",
        },
    },
    patternProperties: {
        "[^name]": {
            type: "object",
            properties: {
                value: {
                    type: "string",
                    default: "default value",
                },
            },
        },
    },
};

export const nestedPatternModel = {
    $id: "root#",
    type: "object",
    properties: {
        name: {
            type: "string",
        },
        nested: {
            type: "object",
            patternProperties: {
                ".*": {
                    type: "object",
                    default: {
                        value: "default value",
                    },
                },
            },
        },
    },
};
