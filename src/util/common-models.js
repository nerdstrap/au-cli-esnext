import _ from 'lodash';

export class EnumSymbol {
    sym = Symbol.for(name);
    ordinal;
    description;
    keyName;

    constructor(name, {ordinal, description}) {
        if (!Object.is) {
            Object.is = function (x, y) {
                // SameValue algorithm
                if (x === y) { // Steps 1-5, 7-10
                    // Steps 6.b-6.e: +0 != -0
                    return x !== 0 || 1 / x === 1 / y;
                } else {
                    // Step 6.a: NaN == NaN
                    return x !== x && y !== y;
                }
            };
        }
        if (!Object.is(ordinal, undefined)) {
            this.ordinal = ordinal;
        }
        if (description) {
            this.description = description;
        }
        this.keyName = name;
        Object.freeze(this);
    }

    get display() {
        return this.description || Symbol.keyFor(this.sym);
    }

    get key() {
        return this.keyName;
    }

    toString() {
        return this.sym;
    }

    valueOf() {
        return this.ordinal;
    }
}

export class Enum {
    constructor(enumLiterals) {
        for (let key in enumLiterals) {
            if (enumLiterals.hasOwnProperty(key)) {
                if (!enumLiterals[key]) {
                    throw new TypeError('each enum should have been initialized with at least empty {} value');
                }
                this[key] = new EnumSymbol(key, enumLiterals[key]);
            }
        }
        Object.freeze(this);
    }

    symbols() {
        let syms = [];
        let self = this;
        Object.keys(this).forEach(function (k) {
            syms.push(self[k]);
        });
        return syms; //for (key of Object.keys(this)) this[key];
    }

    keys() {
        return Object.keys(this);
    }

    contains(sym) {
        if (!(sym instanceof EnumSymbol)) {
            return false;
        }
        return this[Symbol.keyFor(sym.sym)] === sym;
    }

    get(ordinal) {
        let self = this;
        let symbol;
        this.keys().forEach(k => {
            if (self[k].ordinal === +ordinal) {
                symbol = self[k];
            }
        });
        return symbol;
    }
}

export const AuthStatusCode = new Enum({
    Success: {ordinal: 0, description: 'authStatusCode.success'},
    Deny: {ordinal: 1, description: 'authStatusCode.deny'},
    Pending: {ordinal: 2, description: 'authStatusCode.pending'},
    Challenge: {ordinal: 3, description: 'authStatusCode.challenge'}
});

export const ActionCode = new Enum({
    ALLOW: {ordinal: 0, description: 'actionCode.allow'},
    DENY: {ordinal: 1, description: 'actionCode.deny'},
    CHALLENGE: {ordinal: 2, description: 'actionCode.challenge'},
    ENROLL: {ordinal: 3, description: 'actionCode.enroll'}
});

export const CredentialType = new Enum({
    PASSWORD: {ordinal: 0, description: 'credentialType.password'},
    QUESTIONS: {ordinal: 1, description: 'credentialType.questions'},
    PHONE: {ordinal: 2, description: 'credentialType.phone'},
    EMAIL: {ordinal: 3, description: 'credentialType.email'},
    RSATOKEN: {ordinal: 4, description: 'credentialType.rsaToken'}
});

export const ContactType = new Enum({
    PHONE: {ordinal: 0, description: 'contactType.phone'},
    EMAIL: {ordinal: 1, description: 'contactType.email'}
});

export const UserStatus = new Enum({
    NOTENROLLED: {ordinal: 0, description: 'actionCode.notEnrolled'},
    UNVERIFIED: {ordinal: 1, description: 'actionCode.unverified'},
    VERIFIED: {ordinal: 2, description: 'actionCode.verified'},
    DELETE: {ordinal: 3, description: 'actionCode.delete'},
    LOCKOUT: {ordinal: 4, description: 'actionCode.lockout'},
    UNLOCKOUT: {ordinal: 5, description: 'actionCode.unlockout'}
});

export const UserType = new Enum({
    PERSISTENT: {ordinal: 0, description: 'actionCode.persistent'},
    NONPERSISTENT: {ordinal: 1, description: 'actionCode.nonPersistent'},
    BAIT: {ordinal: 2, description: 'actionCode.bait'}
});

let determineShiftedValues = (total, highestValue) => {
    let values = [];
    let runningTotal = total;
    for (let i = highestValue; i >= 0; i--) {
        if (runningTotal >> i === 1) {
            let binValue = Math.pow(2, i);
            runningTotal = runningTotal - binValue;
            values.push(binValue);
        }
    }
    return values;
};

export let EnumeratedTypeHelper = function () {
    return {
        asArray: (type, value) => {
            if (value === undefined) {
                return [];
            }
            let v = determineShiftedValues(value, type.symbols().length);
            let enums = [];
            _.forEach(v, ordinal => {
                enums.push(type.get(ordinal));
            });
            return enums;
        }
    };
}();
