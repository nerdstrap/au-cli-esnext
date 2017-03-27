import {inject, bindable, computedFrom, valueConverter} from 'aurelia-framework';
import {logger} from 'util/logger-helper';
import StringHelper from 'util/string-helper';

@valueConverter("dateFormatter")
export class dateFormatterValueConverter {

    toView(value) {
        return StringHelper.formatDate(value);
    }

    fromView(value) {
        return StringHelper.parseDate(value);
    }

}
