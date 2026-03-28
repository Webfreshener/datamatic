import {Model} from "../index";
import {DataModel, DataModelStateError, DataModelValidationError} from "./index";
import {basicModel, nestedModel} from "../../../fixtures/PropertiesModel.schemas";
import {objectCollection} from "../../../fixtures/ItemsModel.schemas";

const clone = (value) => JSON.parse(JSON.stringify(value));

const createParityPair = ({
    schema,
    initialValue,
    emptyValue,
    deletePolicy,
    hooks,
}) => {
    const owner = new Model({schemas: [schema]});
    owner.model = clone(initialValue);

    const dataModel = new DataModel({
        value: clone(owner.toJSON()),
        emptyValue,
        validator: (value) => owner.model.$model.validate(value),
        deletePolicy,
        hooks,
    });

    return {owner, dataModel};
};

const expectSnapshotsToMatch = (owner, dataModel, expected) => {
    expect(owner.toJSON()).toEqual(expected);
    expect(dataModel.snapshot()).toEqual(expected);
};

describe("DataModel parity", () => {
    it("should preserve valid and invalid root replacement outcomes", () => {
        const initialValue = {
            name: "Ed Testy",
            age: 99,
            active: true,
        };
        const {owner, dataModel} = createParityPair({
            schema: basicModel,
            initialValue,
            emptyValue: {},
        });

        const nextValue = {
            name: "Ed Updated",
            age: 100,
            active: false,
        };

        owner.model = nextValue;
        dataModel.replace(nextValue);
        expectSnapshotsToMatch(owner, dataModel, nextValue);

        owner.model = {
            name: "bad",
            age: 100,
            active: "false",
        };
        expect(() => dataModel.replace({
            name: "bad",
            age: 100,
            active: "false",
        })).toThrow(DataModelValidationError);

        expectSnapshotsToMatch(owner, dataModel, nextValue);
    });

    it("should preserve valid and invalid nested object replacement outcomes", () => {
        const initialValue = {
            aObject: {
                bObject: {
                    bValue: 1234,
                },
            },
        };
        const {owner, dataModel} = createParityPair({
            schema: nestedModel,
            initialValue,
            emptyValue: {},
        });

        owner.model.aObject.bObject = {bValue: 4321};
        dataModel.set("aObject.bObject", {bValue: 4321});
        expectSnapshotsToMatch(owner, dataModel, {
            aObject: {
                bObject: {
                    bValue: 4321,
                },
            },
        });

        owner.model.aObject.bObject = {bValue: "bad"};
        expect(() => dataModel.set("aObject.bObject", {bValue: "bad"}))
            .toThrow(DataModelValidationError);

        expectSnapshotsToMatch(owner, dataModel, {
            aObject: {
                bObject: {
                    bValue: 4321,
                },
            },
        });
    });

    it("should preserve valid and invalid array element update outcomes", () => {
        const initialValue = [
            {name: "Item A", value: 1},
            {name: "Item B"},
            {name: "Item C", value: 2},
        ];
        const {owner, dataModel} = createParityPair({
            schema: objectCollection,
            initialValue,
            emptyValue: [],
        });

        owner.model[1] = {name: "Item B", value: 3};
        dataModel.set([1], {name: "Item B", value: 3});
        expectSnapshotsToMatch(owner, dataModel, [
            {name: "Item A", value: 1},
            {name: "Item B", value: 3},
            {name: "Item C", value: 2},
        ]);

        owner.model[1].value = 4;
        dataModel.set([1, "value"], 4);
        expectSnapshotsToMatch(owner, dataModel, [
            {name: "Item A", value: 1},
            {name: "Item B", value: 4},
            {name: "Item C", value: 2},
        ]);

        owner.model[1].name = 99;
        expect(() => dataModel.set([1, "name"], 99)).toThrow(DataModelValidationError);
        expectSnapshotsToMatch(owner, dataModel, [
            {name: "Item A", value: 1},
            {name: "Item B", value: 4},
            {name: "Item C", value: 2},
        ]);
    });

    it("should preserve explicit required-vs-optional delete outcomes", () => {
        const schema = {
            $id: "root#",
            type: "object",
            required: ["name"],
            properties: {
                name: {type: "string"},
                extra: {
                    type: "object",
                    properties: {
                        note: {type: "string"},
                    },
                },
            },
        };
        const initialValue = {
            name: "ok",
            extra: {
                note: "x",
            },
        };
        const {owner, dataModel} = createParityPair({
            schema,
            initialValue,
            emptyValue: {},
            deletePolicy: (path) => path.join(".") === "name" ?
                "required field cannot be deleted" :
                true,
        });

        delete owner.model.extra.note;
        dataModel.delete("extra.note");
        expectSnapshotsToMatch(owner, dataModel, {
            name: "ok",
            extra: {},
        });

        delete owner.model.name;
        expect(() => dataModel.delete("name"))
            .toThrow("required field cannot be deleted");
        expectSnapshotsToMatch(owner, dataModel, {
            name: "ok",
            extra: {},
        });
    });

    it("should preserve freeze semantics and reject later mutation", () => {
        const initialValue = {
            name: "Ed Testy",
            age: 99,
            active: true,
        };
        const {owner, dataModel} = createParityPair({
            schema: basicModel,
            initialValue,
            emptyValue: {},
        });

        owner.model.$model.freeze();
        dataModel.freeze();

        expect(() => {
            owner.model.name = "Other Name";
        }).toThrow("non-configurable and non-writable");
        expect(() => dataModel.set("name", "Other Name"))
            .toThrow(DataModelStateError);

        expectSnapshotsToMatch(owner, dataModel, initialValue);
    });

    it("should preserve reset semantics with and without stronger complete behavior", () => {
        const schema = {
            $id: "root#",
            type: "object",
            properties: {
                child: {
                    type: "object",
                    properties: {
                        flag: {type: "boolean"},
                    },
                },
            },
        };
        const plainInitial = {
            child: {
                flag: true,
            },
        };
        const completeInitial = {
            child: {
                freeze: jest.fn(),
                flag: true,
            },
        };
        const completeEvents = [];

        const plainOwner = new Model({schemas: [schema]});
        plainOwner.model = clone(plainInitial);
        const plainDataModel = new DataModel({
            value: clone(plainOwner.toJSON()),
            emptyValue: {},
            validator: (value) => plainOwner.model.$model.validate(value),
            hooks: {
                completeDescendants: (value) => completeEvents.push(value),
            },
        });

        plainOwner.model.$model.reset();
        plainDataModel.reset();
        expectSnapshotsToMatch(plainOwner, plainDataModel, {});
        expect(completeEvents).toEqual([]);

        const completeOwner = new Model({schemas: [schema]});
        completeOwner.model = completeInitial;
        const completeDataModel = new DataModel({
            value: clone(completeOwner.toJSON()),
            emptyValue: {},
            validator: (value) => completeOwner.model.$model.validate(value),
            hooks: {
                completeDescendants: (value) => completeEvents.push(value),
            },
        });

        completeOwner.model.$model.reset({complete: true});
        completeDataModel.reset({complete: true});

        expect(completeInitial.child.freeze).toHaveBeenCalled();
        expect(completeEvents).toEqual([{
            child: {
                flag: true,
            },
        }]);
        expectSnapshotsToMatch(completeOwner, completeDataModel, {});
    });
});
