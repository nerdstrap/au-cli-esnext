import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {
    GoToLogin,
    AuthenticateUserSuccess
} from 'resources/messages/login-messages';
import {
    ChallengeCancel,
    ChallengeSuccess,
    ChallengeFail
} from 'resources/messages/challenge-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithCredentials {
    vm = {};
    challengeWithCredentialsViewModel;
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
            if (this.vm.selectedCredentialType === 'challenge-questions') {
                this.challengeWithCredentialsViewModel = './challenge-with-challenge-questions';
            } else if (this.vm.selectedCredentialType === 'phone-info') {
                this.challengeWithCredentialsViewModel = './challenge-with-phone-info';
            } else if (this.vm.selectedCredentialType === 'email-info') {
                this.challengeWithCredentialsViewModel = './challenge-with-email-info';
            } else if (this.vm.selectedCredentialType === 'rsa-token') {
                this.challengeWithCredentialsViewModel = './challenge-with-rsa-token';
            } else {
                this.eventAggregator.publish(new ChallengeFail());
            }
            resolve();
        });
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeCancel, message => this.onChallengeCancel(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeSuccess, message => this.onChallengeSuccess(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeFail, message => this.onChallengeFail(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    onChallengeCancel() {
        this.eventAggregator.publish(new GoToLogin());
    }

    onChallengeSuccess(message) {
        this.eventAggregator.publish(new AuthenticateUserSuccess(message));
    }

    onChallengeFail(message) {
        this.vm.user.sessionId = '';
        this.vm.user.transactionId = '';
    }
}
