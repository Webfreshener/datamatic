import Ajv from "ajv";
import addFormats from "ajv-formats";

export const DRAFT_04_META_ID = "http://json-schema.org/draft-04/schema#";
export const DRAFT_04_META_ID_NOHASH = "http://json-schema.org/draft-04/schema";
export const DRAFT_07_META_ID = "http://json-schema.org/draft-07/schema";
export const DRAFT_07_META_ID_HASH = "http://json-schema.org/draft-07/schema#";

let _ajvDraft04 = null;

export const loadAjvDraft04 = () => {
    if (_ajvDraft04 !== null) {
        return _ajvDraft04 || null;
    }
    try {
        // Lazy-load to avoid hard dependency for non-draft-04 users.
        // eslint-disable-next-line global-require
        const mod = require("ajv-draft-04");
        _ajvDraft04 = mod && mod.default ? mod.default : mod;
    } catch (e) {
        _ajvDraft04 = false;
    }
    return _ajvDraft04 || null;
};

export const isDraft04Meta = (meta) => {
    if (!meta || typeof meta !== "object") {
        return false;
    }
    return meta.$id === DRAFT_04_META_ID
        || meta.id === DRAFT_04_META_ID
        || meta.$id === DRAFT_04_META_ID_NOHASH
        || meta.id === DRAFT_04_META_ID_NOHASH;
};

export const isDraft04Schema = (schema) => {
    if (!schema || typeof schema !== "object") {
        return false;
    }
    return schema.$schema === DRAFT_04_META_ID || schema.$schema === DRAFT_04_META_ID_NOHASH;
};

export const isDraft07Schema = (schema) => {
    if (!schema || typeof schema !== "object") {
        return false;
    }
    return schema.$schema === DRAFT_07_META_ID || schema.$schema === DRAFT_07_META_ID_HASH;
};

const getSchemaList = (schemas) => {
    if (!schemas || typeof schemas !== "object") {
        return [];
    }
    const list = schemas.schemas ? schemas.schemas : schemas;
    return Array.isArray(list) ? list : [list];
};

export const usesDraft04 = (schemas) => getSchemaList(schemas).some(isDraft04Schema);

export const usesDraft07 = (schemas) => getSchemaList(schemas).some(isDraft07Schema);

export const wantsDraft04 = (schemas, opts) => {
    if (opts && opts.draft04 === true) {
        return true;
    }
    return Boolean(schemas && Array.isArray(schemas.meta) && schemas.meta.some(isDraft04Meta));
};

export const getAjvDraftState = (schemas, opts) => {
    const draft04Requested = wantsDraft04(schemas, opts);
    const hasDraft04Schemas = usesDraft04(schemas);
    const hasDraft07Schemas = usesDraft07(schemas);
    return {
        draft04Requested,
        hasDraft04Schemas,
        hasDraft07Schemas,
        useDraft04: draft04Requested && hasDraft04Schemas && !hasDraft07Schemas,
    };
};

export const addMetaSchemaLenient = (_ajv, meta) => {
    const original = _ajv.opts.validateSchema;
    _ajv.opts.validateSchema = false;
    try {
        _ajv.addMetaSchema(meta);
    } finally {
        _ajv.opts.validateSchema = original;
    }
};

const normalizeSchema = (
    schema,
    useDraft04,
    {
        mirrorLegacyIdToDollarId = false,
    } = {}
) => {
    if (!schema || typeof schema !== "object") {
        return schema;
    }

    const withTrailingHash = (id) => id.match(/#+$/) === null ? `${id}#` : id;

    if (schema.hasOwnProperty("$id")) {
        schema.$id = withTrailingHash(schema.$id);
        if (useDraft04 && !schema.hasOwnProperty("id")) {
            schema.id = schema.$id;
        }
    }

    if (schema.hasOwnProperty("id")) {
        schema.id = withTrailingHash(schema.id);
        if (mirrorLegacyIdToDollarId && !schema.hasOwnProperty("$id")) {
            schema.$id = schema.id;
        }
    }

    return schema;
};

export const normalizeSchemaIds = (
    schemas,
    {
        useDraft04 = false,
        mirrorLegacyIdToDollarId = false,
    } = {}
) => {
    if (!schemas || typeof schemas !== "object") {
        return schemas;
    }

    if (schemas.hasOwnProperty("schemas")) {
        if (Array.isArray(schemas.schemas)) {
            schemas.schemas = schemas.schemas.map((schema) => normalizeSchema(schema, useDraft04, {
                mirrorLegacyIdToDollarId,
            }));
        } else {
            schemas.schemas = normalizeSchema(schemas.schemas, useDraft04, {
                mirrorLegacyIdToDollarId,
            });
        }
        return schemas;
    }

    if (Array.isArray(schemas)) {
        return schemas.map((schema) => normalizeSchema(schema, useDraft04, {
            mirrorLegacyIdToDollarId,
        }));
    }

    return normalizeSchema(schemas, useDraft04, {
        mirrorLegacyIdToDollarId,
    });
};

export const createAjvCore = (
    schemas,
    opts,
    {
        applyFormats = false,
    } = {}
) => {
    const {
        draft04Requested,
        hasDraft04Schemas,
        hasDraft07Schemas,
        useDraft04,
    } = getAjvDraftState(schemas, opts);

    if (hasDraft04Schemas && !draft04Requested) {
        throw new Error("Draft-04 schema detected but draft-04 support is not enabled.");
    }

    let AjvCtor = Ajv;
    const ajvOpts = (useDraft04 && !opts.schemaId) ? Object.assign({}, opts, {schemaId: "id"}) : opts;
    if (useDraft04) {
        const Draft04 = loadAjvDraft04();
        if (!Draft04) {
            throw new Error("Draft-04 requested but ajv-draft-04 is not installed.");
        }
        AjvCtor = Draft04;
    }

    const _ajv = new AjvCtor(ajvOpts);
    if (applyFormats) {
        addFormats(_ajv);
    }

    if (schemas && Array.isArray(schemas.meta)) {
        schemas.meta.forEach((meta) => {
            if (useDraft04 && isDraft04Meta(meta)) {
                return;
            }
            if (isDraft04Meta(meta)) {
                addMetaSchemaLenient(_ajv, meta);
                return;
            }
            _ajv.addMetaSchema(meta);
        });
    }

    if (!useDraft04 && hasDraft07Schemas) {
        if (!_ajv.getSchema(DRAFT_07_META_ID) && !_ajv.getSchema(DRAFT_07_META_ID_HASH)) {
            // eslint-disable-next-line global-require
            _ajv.addMetaSchema(require("ajv/dist/refs/json-schema-draft-07.json"));
        }
    }

    return {
        $ajv: _ajv,
        useDraft04,
    };
};
