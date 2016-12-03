class Convert {
    //### @set(key, value)
    //> sets key/value to virtualized _object


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}