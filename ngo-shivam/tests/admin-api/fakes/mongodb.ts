import { randomBytes } from "node:crypto";

/** Test double: only what the admin code needs at run time (ObjectId). */
export class ObjectId {
    private readonly hex: string;
    constructor(value?: string | ObjectId) {
        this.hex = value === undefined ? randomBytes(12).toString("hex") : String(value);
    }
    toHexString() {
        return this.hex;
    }
    toString() {
        return this.hex;
    }
    equals(other: unknown) {
        return other instanceof ObjectId && other.hex === this.hex;
    }
}

export class MongoClient {
    constructor() {
        throw new Error("The test double has no MongoClient: tests must never open a real connection.");
    }
}
