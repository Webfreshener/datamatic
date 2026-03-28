import {parseModelJSON} from "./json";

describe("Model v2 JSON helpers", () => {
    it("parses model bootstrap input from objects and strings", () => {
        const payload = {schemas: [{$id: "root#", type: "object"}]};

        expect(parseModelJSON(payload)).toBe(payload);
        expect(parseModelJSON(JSON.stringify(payload))).toEqual(payload);
    });

    it("preserves the legacy error for unsupported input", () => {
        expect(() => parseModelJSON(1))
            .toThrow("json must be either JSON formatted string or object");
    });
});
