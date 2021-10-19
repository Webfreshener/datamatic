/**
 * AJV Options Config in it's entirely for reference
 * only Model specific option changes are enabled
 *
 * taken verbatim from: https://ajv.js.org/options.html
 * @type {*}
 *
 */
export default {
    // strict mode options (NEW)
    strict: undefined,
    strictSchema: true,
    strictNumbers: true,
    strictTypes: "log",
    strictTuples: "log",
    strictRequired: false,
    allowUnionTypes: false,
    allowMatchingProperties: false,
    validateFormats: true,
    // validation and reporting options:
    $data: false,
    allErrors: false,
    verbose: false,
    discriminator: false,
    unicodeRegExp: true,
    timestamp: undefined,
    parseDate: false,
    allowDate: false,
    int32range: true,
    $comment: false,
    formats: {},
    keywords: [],
    schemas: {},
    logger: undefined,
    loadSchema: undefined, // function(uri: string): Promise {}
    // options to modify validated data:
    removeAdditional: false,
    useDefaults: false,
    coerceTypes: false,
    // advanced options:
    meta: true,
    validateSchema: true,
    addUsedSchema: true,
    inlineRefs: true,
    passContext: false,
    loopRequired: 200,
    loopEnum: 200, // NEW
    ownProperties: false,
    multipleOfPrecision: undefined,
    messages: true, // false with JTD
    code: {
        // NEW
        es5: false,
        lines: false,
        source: false,
        process: undefined, // (code: string) => string
        optimize: true,
    },
};
