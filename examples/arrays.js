var JSD = require('../index').JSD;

// we define an array that accepts objects comprised of a name string and numeric score
var _schema = {
    type: "Array",
    default: [],
    elements: [{
        type: "Object",
        elements: {
            name: {
                type: "String",
                required: true,
                restrict: "^[a-zA-Z0-9\\-\\s]{1,24}$"
            },
            score: {
                type: "Number",
                required: true
            },
        },
    }],
};

var _handler = {
    next: (val) => {
        // outputs: {"values":[{"name":"Player 1","score":2000000},{"name":"Player 2","score":1100000},{"name":"Player 3","score":900000}]}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'score' expected number, type was '<string>'s
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

_jsd.document.model = [{
    name: "Player 1",
    score: 2000000,
}, {
    name: "Player 2",
    score: 1100000
}, {
    // this will error because score is a string value
    name: "BOGUS",
    score: "1100000"
}, {
    name: "Player 3",
    score: 900000
}];
