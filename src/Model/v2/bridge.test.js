import {Model} from "../index";
import {createLegacyModelPipeline} from "./bridge";
import {basicCollection, basicModel} from "../../../fixtures/PropertiesModel.schemas";
import {default as data} from "../../../fixtures/pipes-test.data";

describe("Model v2 pipeline bridge compat seam", () => {
    it("preserves root model pipeline behavior through an explicit compat helper", (done) => {
        const owner = new Model({schemas: [basicCollection]});
        const pipeline = createLegacyModelPipeline(
            owner,
            [(item) => item.active ? item : undefined],
            basicCollection,
        );

        const subscription = pipeline.subscribe({
            next: (value) => {
                subscription.unsubscribe();
                expect(value.length).toBe(3);
                done();
            },
            error: (error) => {
                subscription.unsubscribe();
                done(error);
            }
        });

        owner.model = data;
    });

    it("closes the bridged pipeline when the source model completes", () => {
        const owner = new Model({schemas: [basicModel]});
        owner.model = {name: "A", age: 1, active: true};

        const pipeline = createLegacyModelPipeline(owner);

        owner.freeze();

        expect(pipeline.writable).toBe(false);
    });
});
