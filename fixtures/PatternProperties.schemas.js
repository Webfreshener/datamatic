export const _ns = {
    definitions: {
        collections: {
            patternProperties: {
                ".*": {
                    type: "object",
                    // required: ["name", "properties"],
                    properties: {},
                },
            },
        },
        collectionsProperties: {
            type: "object",
            extensible: false,
            properties: {
                name: {type: "string", pattern: "^[a-zA-Z0-9_]+$"},
                description: {type: "string", pattern: "^[\\w\\s\\W]+$"},
                plural: {type: "string", pattern: "^[a-zA-Z0-9_]+$"},
            },
            patternProperties: {
                ".*[^(name|description|plural)]$": {
                    type: "object",
                    required: ["type"],

                },
            },
        },
        collectionFieldProperties: {
            type: "object",
            properties: {
                default: {
                    anyOf: [
                        {type: "string"},
                        {type: "number"},
                        {type: "object"},
                        {type: "boolean"}
                        ]
                },
                defaultFn: {type: "string", pattern: "^(guid|uuid|uuidv4|now)+$"},
                description: {
                    type: "string",
                    pattern: "^((?!\"|\\b|\\f|\\n|\\r|\\t|\\u).)*$"
                },
                id: {
                    polymorphic: [{type: "boolean"}, {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                required: true,
                                pattern: "^(string|integer)+$"
                            },
                            id: {type: "boolean", required: true},
                            generated: {type: "boolean", required: false},
                        }
                    }]
                },
                index: {type: "boolean"},
                type: {
                    type: "string",
                    pattern: "^(any|array|boolean|Buffer|Date|GeoPoint|integer|object|string)+$"
                },
                required: {type: "boolean", default: false},
                length: {type: "integer", default: null},
                precision: {type: "integer", default: null},
                scale: {type: "integer", default: null},
            },
        },
    },
    type: "object",
    // required: ["collections"],
    properties: {
        collections: {
            //     type: "object",
            //
        },
        options: {
            type: "object",
            // required: ["ALLOWED", "SESSION_KEY", "REST_KEY", "APP_ID", "API_VERSION", "CRUD_METHODS"],
            // default: {
            //     CRUD_METHODS: {
            //         create: "POST",
            //         read: "GET",
            //         update: "PUT",
            //         patch: "PATCH",
            //         destroy: "DELETE",
            //         options: "OPTIONS"
            //     },
            //     VERSION: "1",
            //     MAX_BATCH_SIZE: 50,
            //     DEFAULT_FETCH_LIMIT_OVERRIDE: 50000,
            //     UNDEFINED_CLASSNAME: "__UNDEFINED_CLASSNAME__",
            //     API_URI: "/api",
            //     CORS: false,
            //     PROTOCOL: "http",
            //     HOST: "127.0.0.1",
            //     PORT: 3000,
            //     BASE_PATH: "/api",
            //     CAPITALIZE_CLASSNAMES: true,
            //     ALLOWED: null
            // },
            properties: {
                ALLOWED: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                },
                VERSION: {type: "string", default: "1"},
                APP_ID: {type: "string", pattern: "^[a-zA-Z0-9]{16,32}$"},
                APP_ID_PARAM_NAME: {type: "string"},
                REST_KEYREST_KEY: {type: "string", pattern: "^[a-zA-Z0-9]{16,32}$"},
                REST_KEY_PARAM_NAME: {type: "string"},
                SESSION_TOKEN: {type: "string"},
                SESSION_KEY: {type: "string", pattern: "^[a-zA-Z0-9]{16,32}$"},
                CSRF_TOKEN: {type: "string", pattern: "^[a-zA-Z0-9]{16,32}$"},
                API_VERSION: {type: "string"},
                MAX_BATCH_SIZE: {type: "integer", default: 50},
                DEFAULT_FETCH_LIMIT_OVERRIDE: {type: "integer", default: 50000},
                UNDEFINED_CLASSNAME: {
                    type: "string",
                    // default: "__UNDEFINED_CLASSNAME__",
                    pattern: "^[a-zA-Z0-9_]+$"
                },
                API_URI: {type: "string", default: "/api", pattern: "^\\/?[a-zA-Z0-9_]+\\/?$"},
                CORS: {type: "boolean", default: false},
                PROTOCOL: {type: "string", default: "http", pattern: "^(HTTP|http)+(S|s)?$"},
                HOST: {type: "string", default: "127.0.0.1", pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"},
                PORT: {type: "integer", default: 3000},
                BASE_PATH: {type: "string", default: "/api", "pattern": "^\\/+[a-zA-Z0-9_\\/\\.\\-]+$"},
                CAPITALIZE_CLASSNAMES: {type: "boolean", default: true},
                CRUD_METHODS: {
                    type: "object",
                    properties: {
                        create: {type: "string", pattern: "^POST+$", default: "POST"},
                        read: {type: "string", pattern: "^GET+$", default: "GET"},
                        update: {type: "string", pattern: "^PUT+$", default: "PUT"},
                        destroy: {type: "string", pattern: "^DELETE+$", default: "DELETE"},
                        patch: {type: "string", pattern: "^PATCH+$", default: "PATCH"},
                        options: {type: "string", pattern: "^OPTIONS+$", default: "OPTIONS"}
                    }
                },
                QUERY_PARAM: {type: "string", pattern: "^[a-zA-Z0-9_]+$"}
            }
        }
    }
};

export const _data = {
    // collections: {
    //     TestCol1: {
    //         name: "TestCol1",
    //         plural: "TestCol1",
    //         // properties: {
    //         //     id: {type: "integer"},
    //         //     name: {type: "string"},
    //         //     value: {type: "integer"},
    //         //     createdOn: {type: "string"}
    //         // }
    //     }
    // },
    options: {
        VERSION: "1",
        API_VERSION: "1",
        APP_ID: "ABCDABCDABCDABCDABCDABCD",
        REST_KEY: "EFGH",
        HOST: "0.0.0.0",
        PORT: 80,
        SESSION_KEY: "ABCDABCDABCDABCDABCDABCD",
        ALLOWED: [],
        PROTOCOL: "http",
        BASE_PATH: "/api",
        CRUD_METHODS: {
            create: "POST",
            read: "GET",
            update: "PUT",
            patch: "PATCH",
            destroy: "DELETE",
            options: "OPTIONS"
        }
    }
};
