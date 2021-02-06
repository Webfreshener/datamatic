import {Pipeline} from "../src/Pipeline";
const _pipes = new WeakMap();
export class TestUser {
    constructor(...pipesOrSchemas) {
        _pipes.set(this, new Pipeline(false,pipesOrSchemas));
    }
    get pipe() {
        return _pipes.get(this);
    }

    exec(data) {
        return this.pipe.exec(data);
    }
}

export class TestSubClass extends Pipeline {
    constructor(...pipesOrSchemas) {
        super(...pipesOrSchemas);
    }
}
