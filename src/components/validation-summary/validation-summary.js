import {inject, bindable, computedFrom} from 'aurelia-framework';

export class ValidationSummary {
    @bindable errors = null;
    @bindable autofocus = null;
}
