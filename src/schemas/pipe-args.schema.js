/* istanbul ignore file */
export default {
    $id: "http://schemas.webfreshener.com/v1/vxlib/pipe-args#",
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        Config: {
            $id: "#/definitions/Config",
            type: "object",
            allOf: [{
                required: ["schemas"],
                additionalProperties: false,
                type: "object",
                properties: {
                    schemas: {
                        $ref: "#/definitions/Schemas",
                    },
                    meta: {
                        $ref: "#/definitions/Schemas",
                    },
                    use: {
                        type: "string",
                    },
                },
            }]
        },
        Schemas: {
            $id: "#/definitions/Schemas",
            type: "array",
            items: {
                allOf: [
                    {
                        type: "object"
                    }, {
                        $ref: "#/definitions/Schema",
                    }
                ]

            },
            minItems: 1,
            maxItems: 2,
        },
        Schema: {
            $id: "#/definitions/Schema",
            type: "object",
            properties: {
                $id: {
                    type: "string",
                },
                $schema: {
                    type: "string",
                },
                type: {
                    type: ["string", "array"],
                },
                exec: {
                    not: {},
                },
                execute: {
                    not: {},
                },
                iterate: {
                    not: {},
                },
                loop: {
                    not: {},
                },
                schemas: {
                    not: {},
                },
                meta: {
                    not: {},
                },
                use: {
                    not: {},
                },
            },
        },
    },
    anyOf: [
        {$ref: "#/definitions/Config"},
        {$ref: "#/definitions/Schema"},
        {$ref: "#/definitions/Schemas"},
    ],
};
