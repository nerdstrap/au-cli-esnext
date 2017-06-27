import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {ConfirmDialog} from 'components/views/confirm-dialog/confirm-dialog';
import {logger} from 'util/logger-helper';
import {CredentialType} from 'util/common-models';
import {
    EnrollChallengeQuestionAnswersComplete,
    EnrollPhoneInfosComplete,
    EnrollEmailInfosComplete,
    EnrollCredentialsComplete
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollCredentials {
    vm;
    enrollCredentialsViewModel;
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
            this.vm.credentialType = CredentialType.QUESTIONS;
            this.enrollCredentialsViewModel = 'components/views/enroll-challenge-question-answers/enroll-challenge-question-answers';
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

    skip(event) {
        if (this.vm.credentialType === CredentialType.QUESTIONS) {
            this.eventAggregator.publish(new EnrollCredentialsComplete({credentialType: CredentialType.QUESTIONS}));
        } else {
            let confirmDialogModel;
            if (this.vm.credentialType === CredentialType.PHONE) {
                confirmDialogModel = this.i18n.tr('confirm-skip-enroll-phone-infos-dialog', {returnObjects: true});
            } else if (this.vm.credentialType === CredentialType.EMAIL) {
                confirmDialogModel = this.i18n.tr('confirm-skip-enroll-email-infos-dialog', {returnObjects: true});
            }
            return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false})
                .whenClosed(openDialogResult => {
                    if (!openDialogResult.wasCancelled) {
                        this.next(event);
                    }
                })
                .catch(reason => {
                    logger.error(reason);
                    this.notification.error('confirm_error');
                });
        }
    }

    next(event) {
        if (this.vm.credentialType === CredentialType.QUESTIONS) {
            this.vm.credentialType = CredentialType.PHONE;
            this.enrollCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
        } else if (this.vm.credentialType === CredentialType.PHONE) {
            this.vm.credentialType = CredentialType.EMAIL;
            this.enrollCredentialsViewModel = 'components/views/enroll-email-infos/enroll-email-infos';
        } else if (this.vm.credentialType === CredentialType.EMAIL) {
            this.vm.credentialType = CredentialType.QUESTIONS;
            this.enrollCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
            this.eventAggregator.publish(new EnrollCredentialsComplete());
        }
    }

    get enrollCredentialsComplete() {
        let credentialsComplete = false;
        if (this.vm.credentialType === CredentialType.QUESTIONS) {
            credentialsComplete = this.vm.user.challengeQuestionAnswersComplete;
        } else if (this.vm.credentialType === CredentialType.PHONE) {
            credentialsComplete = this.vm.user.smsInfosComplete;
        } else if (this.vm.credentialType === CredentialType.EMAIL) {
            credentialsComplete = this.vm.user.emailInfosComplete;
        }
        return credentialsComplete;
    }

    onEnrollChallengeQuestionAnswersComplete(message) {
    }

    onEnrollPhoneInfosComplete(message) {
    }

    onEnrollEmailInfosComplete(message) {
    }
}
