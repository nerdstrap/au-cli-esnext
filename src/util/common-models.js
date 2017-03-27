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

export const EnrollmentStep = new Enum({
    DISCLAIMER: {ordinal: 0, description: 'enrollmentStep.disclaimer'},
    INTRO: {ordinal: 1, description: 'enrollmentStep.intro'},
    QUESTIONS: {ordinal: 2, description: 'enrollmentStep.questions'},
    PHONE: {ordinal: 3, description: 'enrollmentStep.phone'},
    EMAIL: {ordinal: 4, description: 'enrollmentStep.email'},
    SUMMARY: {ordinal: 5, description: 'enrollmentStep.summary'}
});

export const ActionCode = new Enum({
    ALLOW: {ordinal: 0, description: 'actionCode.allow'},
    CHALLENGE: {ordinal: 1, description: 'actionCode.challenge'},
    NONE: {ordinal: 2, description: 'actionCode.none'},
    REVIEW: {ordinal: 3, description: 'actionCode.review'}
});

export const CredentialType = new Enum({
    PASSWORD: {ordinal: 0, description: 'credentialType.password'},
    QUESTIONS: {ordinal: 1, description: 'credentialType.questions'},
    SMS: {ordinal: 2, description: 'credentialType.sms'},
    EMAIL: {ordinal: 3, description: 'credentialType.email'},
    ONETIMETOKEN: {ordinal: 4, description: 'credentialType.oneTimeToken'}
});

export const ContactType = new Enum({
    PHONE: {ordinal: 0, description: 'contactType.Phone'},
    EMAIL: {ordinal: 1, description: 'contactType.Email'}
});

export const UserStatus = new Enum({
    ALLOW: {ordinal: 0, description: 'actionCode.allow'},
    LOCKEDOUT: {ordinal: 1, description: 'actionCode.lockedOut'},
    NONE: {ordinal: 2, description: 'actionCode.none'},
    REVIEW: {ordinal: 3, description: 'actionCode.review'}
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
