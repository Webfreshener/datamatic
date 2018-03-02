var JSD = require('../index').JSD;

// we define an element named `value` that requires a name and optional active attributes
var _schema = {
    value: {
        type: "Object",
        required: false,
        elements: {
            name: {
                type: "String",
                required: true
            },
            active: {
                type: "Boolean",
                required: true,
                default: false
            }
        }
    }
};

var _handler = {
    next: (val) => {
        // outputs: {"value":{"name":"Alice","active":true}}
        // outputs: {"value":{"name":"Bob","active":false}}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value.active' expected boolean, type was '<number>'
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// this will error since `active` is a number
_jsd.document.model = {
    value: {
        name: "Alice",
        active: 1,
    }
};

// this will pass
_jsd.document.model = {
    value: {
        name: "Alice",
        active: true
    }
};

// this will also pass since `active` is optional
_jsd.document.model = {
    value: {
        name: "Bob",
    }
};
