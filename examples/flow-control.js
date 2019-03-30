const {RxVO} = require("../index");

// this represents an operation workflow
// this will be performed sequentially via the observer callbacks
const tasks = [
    // TASK 1: Updates the score with VALID data
    // -- will trigger next notification
    () => {
        console.log("\n\n\x1b[4m%s\x1b[0m\n", "Valid update example:");
        obj.model = data;
    },
];

///////////////////////////////////////////////////
// -- Demo Setup below this point
// -- not part of usage example

const doTask = ((tasks) => {
    let nIdx = 0;

    return {
        next: function () {
            return nIdx < tasks.length ?
                {value: tasks[nIdx++](), done: false} :
                {done: true};
        }
    };
})(tasks);
doTask.next();
