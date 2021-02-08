const {Pipeline} = require("datamatic");
const pipeline = new Pipeline({type: "array", items: {type: "string"}});
pipeline.subscribe((d) => console.log(d), (e) => console.log(e));
pipeline.write(["a", "b", "c"]);
