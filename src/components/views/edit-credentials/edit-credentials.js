import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';
import {
    EnrollChallengeQuestionAnswersComplete,
    EnrollPhoneInfosComplete,
    EnrollEmailInfosComplete
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class EditCredentials {
    vm;
    editCredentialsViewModel;
    subscribers = [];

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

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollChallengeQuestionAnswersComplete, message => this.onEnrollChallengeQuestionAnswersComplete(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollPhoneInfosComplete, message => this.onEnrollPhoneInfosComplete(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollEmailInfosComplete, message => this.onEnrollEmailInfosComplete(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    onGoToEnrollChallengeQuestionAnswers(event) {
        this.editCredentialsViewModel = 'components/views/enroll-challenge-question-answers/enroll-challenge-question-answers';
    }

    onEnrollChallengeQuestionAnswersComplete(message) {
        this.editCredentialsViewModel = null;
    }

    onGoToEnrollPhoneInfos(event) {
        this.editCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
    }

    onEnrollPhoneInfosComplete(message) {
        this.editCredentialsViewModel = null;
    }

    onGoToEnrollEmailInfos(event) {
        this.editCredentialsViewModel = 'components/views/enroll-email-infos/enroll-email-infos';
    }

    onEnrollEmailInfosComplete(message) {
        this.editCredentialsViewModel = null;
    }
}
