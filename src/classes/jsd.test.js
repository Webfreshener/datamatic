import {JSD} from './jsd'

describe("JSD Instance Test", () => {
    let _jsd;

    beforeEach(() => {
        _jsd = new JSD();
    });

    it("expects a valid JSD instance",() => {
        expect(_jsd instanceof JSD).toBe(true);
    });

    it("expects JSD Instances to create a valid JSD Document", () => {

        _jsd.document.model = {
            name: 'test',
        };
        console.log(`_jsd.document: ${_jsd.document}`);
        // expect(`${_jsd.document.model.name}`).toEqual('test');
        // expect(`${jsd.document.get('.')}`).toEqual(;
    });
});
