import {inject, bindable, computedFrom, valueConverter} from 'aurelia-framework';
import {logger} from 'util/logger-helper';
import {StringHelper} from 'util/string-helper';

@valueConverter("phoneFormatter")
export class phoneFormatterValueConverter {

    toView(value) {
        return StringHelper.formatPhoneNumber(value);
    }

    fromView(value) {
        return StringHelper.parsePhoneNumber(value)
    }
}
