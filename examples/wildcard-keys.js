var JSD = require('../index').JSD;

// creates a schema that allows any key assignent, but value must be object
var _schema = {
    "*": {
        type: "Object",
        extensible: true,
        elements: {
            name: {
                type: "String",
                required: true,
                restrict: "^[a-zA-Z0-9_\\s\\-]{9,}$"
            },
            score: {
                type: "Number",
                required: true,
            }
        },
    }
};

var _handler = {
    next: (val) => {
        // {"1":{"name":"Big Daddy","score":2000000}, ...}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 1 expected value of type 'Object'. Type was '<number>'
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// this will fail because value is number, not an object
_jsd.document.model = {
    1: 900000,
};

// this succeeds
_jsd.document.model = {
    1: {
        name: "Big Daddy",
        score: 2000000
    },
    2: {
        name: "HeavyMetalPrincess",
        score: 1100000
    },
    3: {
        name: "Munga-Munga",
        score: 900000
    },
};
