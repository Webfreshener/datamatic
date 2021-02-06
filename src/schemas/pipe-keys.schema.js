export default {
    $id: "https://schemas.webfreshener.com/owner/pipe-keys#",
    type: "array",
    items: {
        $ref: "#/definitions/PipeObject",
    },
    definitions: {
        name: {
            type: "string",
        },
        value: {
            oneOf: [
                {
                    $ref: "#/definitions/PipeObject",
                },
                {
                    type: "string",
                },
                {
                    type: "number",
                },
                {
                    type: "boolean",
                },
            ],
        },
        PipeObject: {
            type: "object",
            require: ["name", "value"],
            properties: {
                name: {
                    $ref: "#/definitions/name",
                },
                value: {
                    $ref: "#/definitions/value",
                },
            },
        },
    },
};
