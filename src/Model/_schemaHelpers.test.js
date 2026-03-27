import {_mdRef} from "./_references";
import {PropertiesModel} from "./propertiesModel";
import {Model} from "./index";
import {SchemaHelpers} from "./_schemaHelpers";
import {basicModel} from "../../fixtures/PropertiesModel.schemas";
const _owner = new Model({schemas: [{
        $id: "test#",
        type: "object",
    }]});

describe("SchemaHelpers Class Tests", () => {
    let _schema, _sH;

    // beforeEach(() => {
    //     _owner = new Model(basicModel);
    //     _schema = new PropertiesModel(_owner);
    //     _sH = new SchemaHelpers(_schema);
    // });

    describe("Child Object Methods", () => {
        beforeEach(() => {
            _schema = new PropertiesModel(_owner, "childElement");
            _sH = new SchemaHelpers(_schema);
        });

        it("should set PropertiesModel from Object values", () => {
            expect((typeof _sH.setObject({properties: {name: "bar"}})) === "string").toBe(false);
            expect(_schema.model.properties.name).toBe("bar");
        });

        describe("Create Object", () => {
            it("should create Child PropertiesModel Object", () => {
                let _sC = _sH.createSchemaChild("foo", {}, _mdRef.get(_schema));
                expect((typeof _sC) === "string").toBe(false);
                expect(_sC instanceof PropertiesModel).toBe(true);
            });

            it("should create Child ItemsModel for array values", () => {
                let _sC = _sH.createSchemaChild("foo", [], _mdRef.get(_schema));
                expect((typeof _sC) === "string").toBe(false);
                expect(_sC.constructor.name).toBe("ItemsModel");
            });

            it("should reject scalar child values", () => {
                let _sC = _sH.createSchemaChild("foo", 123, _mdRef.get(_schema));
                expect(_sC).toBe("'foo' was invalid");
            });
        });
        describe("ItemsModel Values", () => {
            it("should set Value Object on Child PropertiesModel", () => {
                const sH = new SchemaHelpers(_schema);
                const _child = sH.setChildObject("", {baz: 123});
                expect(typeof _child).toBe("object");
                expect(_child.baz).toBe(123);
            });
        });

    });
});
