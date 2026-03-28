import {DataModelPathError} from "./errors";

const isContainer = (value) => value !== null && typeof value === "object";

const toSegment = (segment) => {
    if (typeof segment === "number") {
        return segment;
    }

    if (typeof segment !== "string") {
        throw new TypeError("DataModel path segments must be strings or numbers");
    }

    if (/^\d+$/.test(segment)) {
        return Number(segment);
    }

    return segment;
};

export const normalizePath = (path) => {
    if (path === undefined || path === null || path === "" || path === "/" || path === ".") {
        return [];
    }

    if (Array.isArray(path)) {
        return path.map((segment) => toSegment(segment));
    }

    if (typeof path === "number") {
        return [path];
    }

    if (typeof path !== "string") {
        throw new TypeError("DataModel path must be a string, number, or array");
    }

    const segments = (
        path.includes("/") ?
            path.split("/") :
            path.split(".")
    ).filter((segment) => segment !== "");

    return segments.map((segment) => toSegment(segment));
};

export const pathToString = (segments) => {
    if (!segments.length) {
        return "<root>";
    }

    return segments.join(".");
};

export const getAtPath = (value, path) => {
    const segments = normalizePath(path);
    let current = value;

    for (const segment of segments) {
        if (!isContainer(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
            return undefined;
        }
        current = current[segment];
    }

    return current;
};

export const setAtPath = (value, path, nextValue) => {
    const segments = normalizePath(path);

    if (!segments.length) {
        return nextValue;
    }

    if (!isContainer(value)) {
        throw new DataModelPathError("Cannot apply a nested path to a scalar root value", {
            path: pathToString(segments),
        });
    }

    const candidate = Array.isArray(value) ? [...value] : {...value};
    let current = candidate;

    for (let index = 0; index < segments.length - 1; index++) {
        const segment = segments[index];

        if (!Object.prototype.hasOwnProperty.call(current, segment)) {
            throw new DataModelPathError("Path does not exist", {
                path: pathToString(segments),
                segment,
                index,
            });
        }

        const branch = current[segment];
        if (!isContainer(branch)) {
            throw new DataModelPathError("Path cannot traverse a scalar value", {
                path: pathToString(segments),
                segment,
                index,
            });
        }

        current[segment] = Array.isArray(branch) ? [...branch] : {...branch};
        current = current[segment];
    }

    current[segments[segments.length - 1]] = nextValue;
    return candidate;
};

export const deleteAtPath = (value, path) => {
    const segments = normalizePath(path);

    if (!segments.length) {
        throw new DataModelPathError("Cannot delete the root path", {
            path: "<root>",
        });
    }

    if (!isContainer(value)) {
        throw new DataModelPathError("Cannot apply a nested path to a scalar root value", {
            path: pathToString(segments),
        });
    }

    const candidate = Array.isArray(value) ? [...value] : {...value};
    let current = candidate;

    for (let index = 0; index < segments.length - 1; index++) {
        const segment = segments[index];

        if (!Object.prototype.hasOwnProperty.call(current, segment)) {
            throw new DataModelPathError("Path does not exist", {
                path: pathToString(segments),
                segment,
                index,
            });
        }

        const branch = current[segment];
        if (!isContainer(branch)) {
            throw new DataModelPathError("Path cannot traverse a scalar value", {
                path: pathToString(segments),
                segment,
                index,
            });
        }

        current[segment] = Array.isArray(branch) ? [...branch] : {...branch};
        current = current[segment];
    }

    const key = segments[segments.length - 1];

    if (Array.isArray(current)) {
        if (typeof key !== "number" || key < 0 || key >= current.length) {
            throw new DataModelPathError("Array delete path is out of bounds", {
                path: pathToString(segments),
                key,
            });
        }

        current.splice(key, 1);
        return candidate;
    }

    if (!Object.prototype.hasOwnProperty.call(current, key)) {
        throw new DataModelPathError("Path does not exist", {
            path: pathToString(segments),
            key,
        });
    }

    delete current[key];
    return candidate;
};
