export default {
    id: "https://schemas.webfreshener.com/rxvo#",
    schema: {
        oneOf: [
            {
                $ref: "#definitions/Schema",
            },
            {
                $ref: "#definitions/Pipe",
            },
        ],
    },
    definitions: {
        PipeConfig: {

        },
        Tags: {
            type: "array",
            items: {
                type: "string",
            }
        },
        Schema: {
            oneOf: [
                {
                    $ref: "http://json-schema.org/draft-04/schema#",
                },
                {
                    $ref: "http://json-schema.org/draft-06/schema#",
                },
            ],
        },
        Link: {
            type: "object",
            required: ["pipe"],
            properties: {
                pipe: {

                },
                callback: {
                },
            },
        },
        Pipe: {
            type: "object",
            required: ["schema"],
            properties: {
                tags: {
                    $ref: "#/definitions/Tags",
                },
                values: {
                    $ref: "https://schemas.webfreshener.com/rxvo/pipe-keys#",
                },
                schema: {
                    $ref: "#definitions/Schema",
                },
                callback: {
                },
            },
        },
    },
};
