export const parseModelJSON = (json) => {
    const typeMatch = (typeof json).match(/^(string|object)+$/);

    if (!typeMatch) {
        throw new Error("json must be either JSON formatted string or object");
    }

    return typeMatch[1] === "string" ? JSON.parse(json) : json;
};
