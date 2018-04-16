var JSD = require('../index').JSD;

var _schema = {
    type: "object",
    properties: {
        name: {
            "type": "string",
        },
        score: {
            type: "integer",
            default: 0,
        },
    },
    required: ["name"],
};

var _handlers = {
    next: function (schema) {
        if (typeof schema !== 'undefined') {
            // outputs: {"name":"Frank","age":23}
            console.log(`${schema}`);
        }
    },
    error: function (e) {
        // error: 'age' expected number, type was '<string>'
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handlers);

// set invalid data to the model to trigger error handler
_jsd.document.model = {
    "name": "Frank",
    "age": "23"
};

// set valid data to the model to trigger next handler
_jsd.document.model = {
    "name": "Frank",
    "age": 23
};
