import {RxVO} from "./rxvo";

const _pipes = new WeakMap();

export class Pipe {
    constructor(vo, cb, schema) {
        const _outVO = new RxVO({
            schemas: Array.isArray(schema) ? schema : [schema],
        });

        const _sub = vo.subscribe({
            next: (data) => {
                const {once} = _pipes.get(this);
                console.log("NEXT");
                // capture output of callback
                const _t = cb(data);
                if ((typeof _t) === "object") {
                    _outVO.model = _t;
                }

                if (once) {
                    // unsubs from subscription
                    // we do there here to unsub before waiting on callback
                    this.close();
                }
            },
            complete: this.close,
        });

        _pipes.set(this, {
            vo: vo,
            schema: schema,
            out: _outVO,
            once: false,
            listener: _sub,
            links: new WeakMap(),
            cb: cb
        });
    }

    /**
     * creates array of new `pipe` segments
     * @param mappings
     * @returns {*}
     */
    split(mappings) {
        return mappings.map((o) => this.pipe(o.cb, o.schema));
    }

    /**
     * writes data to pipe segment
     * @param data
     * @returns {Pipe}
     */
    write(data) {
        _pipes.get(this).out.model = data;
        return this;
    }

    /**
     * creates clone of current `pipe` segment
     * @returns {Pipe}
     */
    fork() {
        const {vo, schema} = _pipes.get(this);
        return new Pipe(vo, schema);
    }

    /**
     * links pipe segment to direct output to target pipe
     * @param cb
     * @param target
     * @returns {Pipe}
     */
    link(cb, target) {
        const _sub = _pipes.get(this).out.subscribe({
            next: (data) => target.write(cb(data)),
            complete: () => this.unlink(target),
        });
        _pipes.get(this).links.set(target, _sub);
        return this;
    }

    /**
     * unlinks pipe segment from target pipe
     * @param target
     * @returns {Pipe}
     */
    unlink(target) {
        const _sub = _pipes.get(this).links.get(target);
        if (_sub) {
            _sub.unsubscribe();
            _pipes.get(this).links.set(target, null);
        }
        return this;
    }

    /**
     * terminates input on `pipe` segment
     * @returns {Pipe}
     */
    close() {
        _pipes.get(this).listener.unsubscribe();
        return this;
    }

    /**
     * returns chained `pipe` segment
     * @param cb
     * @param schema
     * @returns {Pipe}
     */
    pipe(cb, schema) {
        return new Pipe(_pipes.get(this).out, cb, schema);
    }

    /**
     * informs `pipe` to close after first notification
     * @returns {Pipe}
     */
    once() {
        _pipes.get(this).once = true;
        return this;
    }

    /**
     * subscribes to `pipe` output notifications
     * @param handler
     * @returns {Observable}
     */
    subscribe(handler) {
        if (!(typeof handler).match(/^(function|object)$/)) {
            throw "handler required for Pipe::subscribe";
        }
        return _pipes.get(this).out.subscribe(handler);
    }
}
