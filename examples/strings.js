var JSD = require('../index').JSD;

var _schema = {
    value: {
        type: "String",
        required: true,
        restrict: "^[a-zA-Z0-9_\\s\\-]+$"
    }
};

var _handler = {
    next: (val) => {
        // outputs: {"value":"false"}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected string, type was '<boolean>'
        console.log(`error: ${e}`);
    }
};


var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// this fails because type is boolean
_jsd.document.model = {value: true};

// this will succeeed
_jsd.document.model = {value: "false"};
