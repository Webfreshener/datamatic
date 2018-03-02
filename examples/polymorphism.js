var JSD = require('../index').JSD;

var _schema = {
    polyValue: {
        required: true,
        default: "DEFAULT VALUE",
        polymorphic: [
            // this schema will accept a string value
            {
                type: "String",
                restrict: "^[a-zA-Z0-9_\\s]+$",

            },
            // ... or and object with `name` and `description` elements
            {
                type: "Object",
                elements: {
                    name: {
                        type: "String",
                        required: true,
                        restrict: "^[a-zA-Z0-9_\\s]{1,24}$"
                    },
                    description: {
                        type: "String",
                        required: true,
                        restrict: "^[a-zA-Z0-9_\\s]{1,140}$"
                    },
                },
            },
            // ... or a wildcard key & numeric value pair
            {
                type: "Object",
                elements: {
                    "*": {
                        type: "Number"
                    },
                },
            }]
    }
};

var _handler = {
    next: (val) => {
        // {"polyValue":"DEFAULT VALUE"}
        // {"polyValue":"HeavyMetalPrincess"}
        // {"polyValue":{"name":"HeavyMetalPrincess","description":"cupcakes"}}
        // {"polyValue":{"HeavyMetalPrincess":10001234}}
        console.log(`${val}`);
    },
    error: (e) => {
        // error: 'polyValue.polymorphic.2.*' expected number, type was '<string>'
        console.log(`error: ${e}`);
    }

};

var _jsd = new JSD(_schema, {debug: true});
_jsd.document.subscribe(_handler);

// will set default value
_jsd.document.model = {};


// can be a string value
_jsd.document.model = {
    "polyValue": "HeavyMetalPrincess",
}

// can be an object with `name` and `description` elements
_jsd.document.model = {
    "polyValue": {
        "name": "HeavyMetalPrincess",
        "description": "cupcakes",
    }
};

// or a wildcard key & numeric value pair...

// -- this will error because the value is a string, not numeric
_jsd.document.model = {
    "polyValue": {
        HeavyMetalPrincess: "10001234",
    },
};

// -- this has a numeric value and will succeed
_jsd.document.model = {
    "polyValue": {
        HeavyMetalPrincess: 10001234,
    },
};
