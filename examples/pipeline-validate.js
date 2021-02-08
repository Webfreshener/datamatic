const {Pipeline} = require("..");
/*
    defines a schema that requires an array of objects
    validates entire model as per the JSON-Schema below
 */
const schema = {
    type: "array",
    items: {
        type: "object",
        required: ["name", "age", "active"],
        properties: {
            name: {
                $comment: "names must be in form: First Middle|MI Last",
                type: "string",
                pattern: "^[a-zA-Z]{1,24}\\s?[a-zA-Z]?\\s+[a-zA-Z]{1,24}$",
            },
            age: {
                $comment: "age must be a number equal to or higher than 21 and lower than 100",
                type: "number",
                minimum: 21,
                maximum: 100,
            },
            active: {
                $comment: "active must equal true",
                type: "boolean",
                const: true,
            },
        },
    },
};

/*
    This TxPipe shows a basic use-case where we perform a transformation on the data model
    The Array brackets denote a TxIterator instance that will act as an
    inline pipe operating iteratively upon a data set
 */
const _validator = new Pipeline(
    [
        // any function wrapped in a JS Array will allow operate iteratively upon all items in the set
        (d) => Object.assign({}, d,{active: true}),
        // the list can go on ...
    ],
    // JSON-Schema on the top level will validate and pass/fail the entire model
    // bear in mind that schema validation is in itself a pipeline execution stage
    schema,
    // the list can go on ...
);

_validator.subscribe({
    // should only contain active people who are 21 and over
    next: (d) => console.log(`\nvalidated result:\n${JSON.stringify(d)}`),
    // in validator mode, any model that doesn't validate will trigger an error
    // you could also choose to take action on the error by forking error object to other pipe
    error: (e) => console.log(`\nvalidation error:\n${JSON.stringify(e, null, 2)}`),
});

// -- this set is invalid and will fail
_validator.write([
    {name: "Alice Dodson", age: 30, active: false}, // will pass after "active" value transform in TxPipe
    {name: "Jim-Bob", age: 21, active: true}, // will be filtered because of name format
    {name: "Bob Roberts", age: 38, active: true}, // will pass
    {name: "Chris Appleton", age: 19, active: true}, // will be filtered because of age
    {name: "Fred Franks", age: 20, active: true}, // will be filtered because of age
    {name: "Sam Smith", age: 25, active: true}, // will pass
    {name: "", active: null}, // will be filtered because of invalid object format
]);

// note: even after error notification, TxPipe is still viable
// -- this set is valid and will pass
_validator.write([
    {name: "Alice Dodson", age: 30, active: false}, // will pass after "active" value transform in TxPipe
    {name: "Bob Roberts", age: 38, active: true}, // will pass
    {name: "Sam Smith", age: 25, active: true}, // will pass
]);
