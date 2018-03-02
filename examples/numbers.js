var JSD = require('../index').JSD;

var _schema = {
    value: {
        type: "Number",
        required: true,
        // default: true,
    }
};

var _handler = {
    next: (val) => {
        // outputs: {"value":1234}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'value' expected number, type was '<string>'
        console.log(`error: ${e}`);
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// this fails because the value is a string
_jsd.document.model = {value: "1234"};

// this will succeed
_jsd.document.model = {value: 1234};
