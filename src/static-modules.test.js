import ajvOptions from "./ajv-options";
import defaultPipeVo from "./schemas/default-pipe-vo.schema";
import draft04 from "./schemas/json-schema-draft-04";
import draft06 from "./schemas/json-schema-draft-06";
import pipeArgs from "./schemas/pipe-args.schema";
import {Pipeline} from "./Pipeline";
import {Pipeline as PipelineIndex, TxValidator} from "./Pipeline/index";

import * as ItemsModelSchemas from "../fixtures/ItemsModel.schemas";
import OpenAPIv3 from "../fixtures/OpenAPIv3";
import * as PropertiesModelSchemas from "../fixtures/PropertiesModel.schemas";
import basicRefsSchema from "../fixtures/basic-refs.schema";
import {TestUser, TestSubClass} from "../fixtures/pipes-instances";
import pipesOrSchema from "../fixtures/pipes-or-schema";
import pipesTestData from "../fixtures/pipes-test.data";

describe("static module exports", () => {
    it("loads schema and options modules", () => {
        expect(ajvOptions).toBeDefined();
        expect(defaultPipeVo.$id).toBeDefined();
        expect(draft04.$id).toBeDefined();
        expect(draft06.$id).toBeDefined();
        expect(pipeArgs.$id).toBeDefined();
        expect(PipelineIndex).toBe(Pipeline);
        expect(TxValidator).toBeDefined();
    });

    it("loads fixture modules", () => {
        expect(ItemsModelSchemas.stringsCollection).toBeDefined();
        expect(OpenAPIv3).toBeDefined();
        expect(PropertiesModelSchemas.basicCollection).toBeDefined();
        expect(basicRefsSchema).toBeDefined();
        expect(pipesOrSchema).toBeDefined();
        expect(pipesTestData).toBeDefined();
    });

    it("covers fixture pipeline helpers", () => {
        const user = new TestUser();
        expect(user.pipe).toBeInstanceOf(Pipeline);
        expect(typeof user.exec).toBe("function");
        expect(() => user.exec("x")).toThrow();
        const sub = new TestSubClass();
        expect(sub).toBeInstanceOf(Pipeline);
    });
});
