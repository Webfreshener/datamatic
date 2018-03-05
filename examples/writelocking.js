var JSD = require('../index').JSD;

// creates a schema with writeLock attribute set to true
var _schema = {
    writeLock: true,
    elements: {
        "*": {
            type: "*",
        }
    }
};

var _handler = {
    next: function(val) {
        // {"valueA":1,"valueB":2,"valueC":3}
        // {"valueA":1,"valueB":2,"valueC":3}
        console.log(`${val}`);
    },
    complete: function(model) {
        // complete: schema is now locked.
        console.log('complete: schema is now locked.');
    }
};

var _jsd = new JSD(_schema);
_jsd.document.subscribe(_handler);

// will lock schema after write
_jsd.document.model = {
    valueA: 1,
    valueB: 2,
    valueC: 3,
};

// subsequent writes will silently fail
_jsd.document.model = {
    valueD: 4,
    valueE: 5,
    valueF: 6,
};
