/////////////////////////////////////////////////
// RxVO
// (c)2016-2018 Van Schroeder <van@webfreshener.com>
// License: The MIT License (MIT)
/////////////////////////////////////////////////
//== Polyfills Object.assign
if (typeof Object.assign !== "function") {
    Object.assign = require('object.assign/polyfill')();
}
export {RxVO} from './classes/rxvo';
