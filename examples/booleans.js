var JSD = require('../index').JSD;

var _schema = {
    value: {
        type: "Boolean",
        required: false,
        default: true,
    }
};

var _handler = {
    next: (val) => {
        // outputs: {"value":true}
        // outputs: {"value":true}
        // outputs: {"value":false}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected boolean, type was '<string>'
        console.log(`error: ${e}`);
    }
};


var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// - this will trigger the default value
_jsd.document.model = {};

// set value to true
_jsd.document.model = {value: true};

// set value to false
_jsd.document.model = {value: false};

// triggers error due to type mismatch
_jsd.document.model = {value: "true"};
