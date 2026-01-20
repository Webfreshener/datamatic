import {Model} from "./index";
import {basicModel, nameRequiredSchema, nestedModel} from "../../fixtures/PropertiesModel.schemas";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const waitForEvent = (register, timeoutMs = 500) => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
        reject(new Error("observer did not emit in time"));
    }, timeoutMs);

    register(
        (value) => {
            clearTimeout(timeout);
            resolve(value);
        },
        (err) => {
            clearTimeout(timeout);
            reject(err);
        }
    );
});

describe("Observability public API", () => {
    it("emits next on model update via Model.subscribe", async () => {
        const owner = new Model({schemas: [basicModel]});
        const data = {name: "A", age: 1, active: true};

        const result = await waitForEvent((resolve, reject) => {
            const sub = owner.subscribe({
                next: (model) => {
                    sub.unsubscribe();
                    resolve(model.toJSON());
                },
                error: (e) => {
                    sub.unsubscribe();
                    reject(e);
                }
            });
            owner.model = data;
        });

        expect(result).toEqual(data);
    });

    it("emits next on model update via BaseModel.subscribe", async () => {
        const owner = new Model({schemas: [basicModel]});
        const root = owner.model.$model;
        const data = {name: "B", age: 2, active: false};

        const result = await waitForEvent((resolve, reject) => {
            const sub = root.subscribe({
                next: (model) => {
                    sub.unsubscribe();
                    resolve(model.toJSON());
                },
                error: (e) => {
                    sub.unsubscribe();
                    reject(e);
                }
            });
            owner.model = data;
        });

        expect(result).toEqual(data);
    });

    it("emits next for a nested path via subscribeTo", async () => {
        const owner = new Model({schemas: [nestedModel]});
        owner.model = {aObject: {bObject: {bValue: 1}}};
        const childPath = owner.model.aObject.$model.path;

        const result = await waitForEvent((resolve, reject) => {
            const sub = owner.subscribeTo(childPath, {
                next: (model) => {
                    sub.unsubscribe();
                    resolve(model.toJSON());
                },
                error: (e) => {
                    sub.unsubscribe();
                    reject(e);
                }
            });
            owner.model.aObject.$model.set("bObject", {bValue: 2});
        });

        expect(result.bObject.bValue).toBe(2);
    });

    it("stops emitting after unsubscribe", async () => {
        const owner = new Model({schemas: [basicModel]});
        const data1 = {name: "C", age: 3, active: true};
        const data2 = {name: "D", age: 4, active: false};
        const next = jest.fn();

        const sub = owner.subscribe({next});
        owner.model = data1;
        await tick();
        sub.unsubscribe();

        owner.model = data2;
        await tick();

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("emits error and not next on invalid data", async () => {
        const owner = new Model({schemas: [nameRequiredSchema]});
        const next = jest.fn();

        const err = await waitForEvent((resolve, reject) => {
            const sub = owner.subscribe({
                next,
                error: (e) => {
                    sub.unsubscribe();
                    resolve(e);
                }
            });
            owner.model = {active: true};
        });

        expect(err).toBeTruthy();
        expect(next).not.toHaveBeenCalled();
    });

    it("emits complete on freeze and blocks further next events", async () => {
        const owner = new Model({schemas: [basicModel]});
        const next = jest.fn();

        await waitForEvent((resolve, reject) => {
            const sub = owner.subscribe({
                next,
                complete: () => {
                    sub.unsubscribe();
                    resolve();
                },
                error: (e) => {
                    sub.unsubscribe();
                    reject(e);
                }
            });
            owner.freeze();
        });

        owner.model = {name: "E", age: 5, active: true};
        await tick();
        expect(next).toHaveBeenCalledTimes(0);
    });
});
