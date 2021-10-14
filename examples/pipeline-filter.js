const {Pipeline} = require("..");
/*
    defines a schema that requires name, age and active attributes
    filters out all items that do not conform to JSON-Schema below
 */
const schema = {
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
};


const pipeline = new Pipeline(
    [
        // By nesting an item schema within an iterator, the schema is applied as a filter
        schema,
        // the list can go on ...
    ],
    // the list can go on ...
);

pipeline.subscribe({
    // should only contain active people who are 21 and over and name pattern match
    next: (d) => console.log(`filtered results:\n${JSON.stringify(d)}`),
    // it should not encounter an error unless it is critical, so full stop
    error: (e) => throw(`pipeline encountered error:\n${JSON.stringify(e)}`),
});

pipeline.write([
    {name: "Alice Dodson", age: 30, active: false}, // will be filtered because of active status
    {name: "Jim-Bob", age: 21, active: true}, // will be filtered because of name format
    {name: "Bob Roberts", age: 38, active: true}, // will pass
    {name: "Chris Appleton", age: 19, active: true}, // will be filtered because of age
    {name: "Fred Franks", age: 20, active: true}, // will be filtered because of age
    {name: "Sam Smith", age: 25, active: true}, // will pass
    {name: "", active: null}, // will be filtered because of invalid object format
]);
