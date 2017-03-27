import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {
    GoToChallengeQuestionAnswers,
    GoToPhoneInfos,
    GoToEmailInfos
} from 'resources/messages/enrollment-messages';
import {logger} from 'util/logger-helper';


@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollmentIntro {
    vm = {};

    constructor(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            resolve();
        });
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
