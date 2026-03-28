export class DataModelValidationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "DataModelValidationError";
        this.details = details;
    }
}

export class DataModelStateError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "DataModelStateError";
        this.details = details;
    }
}

export class DataModelPathError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = "DataModelPathError";
        this.details = details;
    }
}
