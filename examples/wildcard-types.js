var JSD = require('../index').JSD;

// creates a schema that lets key `value` be set to any scalar type (string, bool, number etc)
var _schema = {
    value: {
        type: "*",
    }
};

var _handler = {
    next: (val) => {
        // outputs: {"value":900000}
        // outputs: {"value":"A string"}
        // outputs: {"value":false}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: element 'bogus' is not a valid element
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// any model with the key named `value` is ok
_jsd.document.model = {
    value: 900000,
};

// any model with the key named `value` is ok
_jsd.document.model = {
    value: "A string",
};

// any model with the key named `value` is ok
_jsd.document.model = {
    value: false,
};

// this will fail because key `bogus` is not allowed
_jsd.document.model = {
    bogus: "false",
};
