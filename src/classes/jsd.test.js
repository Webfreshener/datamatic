import {JSD} from './jsd'

describe("JSD Instance Test", () => {
    let _jsd;

    beforeEach(() => {
        _jsd = new JSD();
        console.log(`_jsd: ${_jsd}`);
    });

    it.only("expects a valid JSD instance",() => {
        expect(_jsd instanceof JSD).toBe(true);
    });

    it("expects JSD Instances to create a valid JSD Document", () => {
        _jsd.document = {
            name: 'test',
        };
        expect(`${jsd.document.name}`).toEqual('test');
        console.log(`${jsd.document.get('.')}`);
        // expect(`${jsd.document.get('.')}`).toEqual(;
    });
});
