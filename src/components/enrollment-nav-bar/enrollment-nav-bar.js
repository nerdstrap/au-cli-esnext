import {inject, bindable, computedFrom, bindingMode, BindingEngine} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';
import {
    GoToChallengeQuestionAnswers,
    GoToPhoneInfos,
    GoToEmailInfos
} from 'resources/messages/enrollment-messages';

@inject(BindingEngine, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollmentNavBar {
    vm = {
        user: {},
        showNavBar: false
    };

    constructor(bindingEngine, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.bindingEngine = bindingEngine;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
    }

    bind(bindingContext, overrideContext) {
        this.vm = bindingContext.vm;
    }

    goToChallengeQuestionAnswers(event) {
        this.eventAggregator.publish(new GoToChallengeQuestionAnswers());
    }

    goToPhoneInfos(event) {
        this.eventAggregator.publish(new GoToPhoneInfos());
    }

    goToEmailInfos(event) {
        this.eventAggregator.publish(new GoToEmailInfos());
    }
}
