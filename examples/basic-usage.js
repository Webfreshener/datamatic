const RxVO = require('../index').RxVO;

// JSON-SCHEMA for Scores Collection
const schema = {
    "id": "root#",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
        },
        "topScores": {
            "type": "array",
            "minItems": 1,
            "maxItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "score": {
                        "type": "integer",
                        "default": 0
                    }
                },
                "required": ["name"]
            }
        }
    },
    required: ["name", "topScores"],
};

const data = {
    name: "JSONville",
    topScores: [{
        name: "Player 1",
        score: 12300000,
    }, {
        name: "Player 2",
        score: 45600000,
    }, {
        name: "Player 3",
        score: 78900000,
    }]
};

// instantiate our Model
const obj = new RxVO({schemas: [schema]});

// subscribes an observer to the Model
obj.subscribe({
    next: function (ref) {
        console.log("\t>> update succeeded!\n\t%s\n\t%s\n\n",
            "current object state:", "" + JSON.stringify(ref));
        doTask.next();

    },
    complete: function (ref) {
        console.log("\t>> %s",
            "object is frozen and no longer editable");
        doTask.next()
    },
    error: function (e) {
        console.log("\t>> update FAILED with error:\n\t%s\n",
            JSON.stringify(e));
        console.log("\tcurrent object state:\n\t%s\n", obj);
        doTask.next();
    },
});

// this represents an operation workflow
// this will be performed sequentially via the observer callbacks
const tasks = [() => {
    // TASK 1: Updates the score with VALID data
    // -- will trigger next notification
    console.log("\n\n\x1b[4m%s\x1b[0m\n", "Valid update example:");
    obj.model = data;
}, () => {
    // TASK 2: Updates the score with INVALID data (incorrect data type)
    // -- will trigger error notification
    console.log("\x1b[4m%s\x1b[0m\n", "Invalid Data error example:");
    obj.model.topScores[0].score = "false";
}, () => {
    // TASK 3: Updates the score with INVALID data (length > maxItems)
    // -- will trigger error notification
    console.log("\x1b[4m%s\x1b[0m\n", "Max length exceeded error example:");
    obj.model.topScores.splice(0, 0, {
        name: "Player 4",
        score: 10111200,
    });
}, () => {
    // TASK 4: Updates the score with invalid data (length < minItems)
    // -- will trigger error notification
    console.log("\x1b[4m%s\x1b[0m\n", "Min length exceeded error example:");
    obj.model.topScores.splice(0, obj.model.topScores.length);
}, () => {
    // TASK 5: Model methods (validate / freeze)
    console.log("\x1b[4m%s\x1b[0m\n", "Test validation example:");

    // allows validate validation without effecting model state
    var result = obj.model.topScores.$model.validate([{
        name: "Player 4",
        score: 12300000,
    }, {
        name: "Player 5",
        score: 45600000,
    }, {
        name: "Player 6",
        score: 78900000,
    }]);

    console.log("\tvalidation result: %s\n", result);

    // this will fail because it's missing
    // the NAME property which is required
    result = obj.model.$model.validate({
        topScores: [{
            name: "Player 1",
            score: 12300000,
        }, {
            name: "Player 2",
            score: 45600000,
        }, {
            name: "Player 3",
            score: 78900000,
        }]
    });

    console.log("\tvalidation result: %s\n", result);

    console.log("\x1b[4m%s\x1b[0m\n", "Model freeze example:");

    // allows entire model hierarchy to be frozen
    obj.model.$model.freeze();

    // can validate model's frozen status
    console.log("\tmodel is frozen:", obj.model.$model.isFrozen);

    // can no longer update the score with valid data
    console.log("\tscore before increment:", obj.model.topScores[0].score);

    try {
        // attempt to perform increment
        obj.model.topScores[0].score++;
    } catch (e) {
        console.log(`\n\tOOPS! ${JSON.stringify(e)}`);
    }

    // outputs to confirm no change to state
    console.log("\tscore after increment: %s\n", obj.model.topScores[0].score);
}];

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
