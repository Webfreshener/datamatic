/////////////////////////////////////////////////
// JSD
// (c)2015-2017 Van Schroeder <van@webfreshener.com>
/////////////////////////////////////////////////
//== Polyfills Object.assign
if (typeof Object.assign != "function") {
    Object.assign = function (target) {
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }
        target = Object(target);
        let index = 1;
        while (index < arguments.length) {
            let source = arguments[index];
            if (source !== null) {
                for (let key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            index = index + 1;
        }
        return target;
    }
}
export {JSD} from './classes/jsd';