import {Pipe} from "./Pipe";

const _iterators = new WeakMap();
const _pipes = new WeakMap();

export class Iterator {
    constructor(...pipesOrSchemas) {
        const _pipe = new Pipe(...pipesOrSchemas);
        _pipes.set(this, _pipe);
        _iterators.set(this, [...pipesOrSchemas]);
    }

    get schema() {
        return _pipes.get(this).schema;
    }

    loop(records) {
        if (!Array.isArray(records)) {
            throw {
                error: {
                    message: "iterators accept iterable values only"
                },
                data: records,
            }
        }

        let _res = [];
        records.forEach(
            (__) => {
                const _it = _pipes.get(this).txYield(__);
                let _done = false;
                let _value = __;
                while (!_done) {
                    try {
                        let {done, value} = _it.next(_value);
                        if (!(_done = done)) {
                            _value = value;
                        }
                    } catch (e) {
                        _value = void 0;
                    }
                }

                if (_value !== void 0) {
                    _res[_res.length] = _value;
                }
            });

        return _res;
    }
}
