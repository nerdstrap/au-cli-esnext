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
    GoToLogout,
    AuthenticateUserSuccess,
    AuthenticateUserFail
} from 'resources/messages/login-messages';
import {
    ChallengeStart,
    ChallengeCancel,
    ChallengeSuccess,
    ChallengeFail,
    ChallengeComplete
} from 'resources/messages/challenge-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithCredentials {
    vm;
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
                this.challengePreAuthUser('Questions')
                    .then(response => {
                        this.challengeWithCredentialsViewModel = 'components/views/challenge-with-challenge-questions/challenge-with-challenge-questions';
                        resolve();
                    });
            } else if (this.vm.selectedCredentialType === 'phone-info') {
                this.getPreAuthUser('Phone')
                    .then(response => {
                        this.challengeWithCredentialsViewModel = 'components/views/challenge-with-phone-info/challenge-with-phone-info';
                        resolve();
                    });
            } else if (this.vm.selectedCredentialType === 'email-info') {
                this.challengeWithCredentialsViewModel = 'components/views/challenge-with-email-info/challenge-with-email-info';
            } else if (this.vm.selectedCredentialType === 'rsa-token') {
                this.challengeWithCredentialsViewModel = 'components/views/challenge-with-rsa-token/challenge-with-rsa-token';
            } else {
                this.eventAggregator.publish(new ChallengeFail());
            }

        });
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeStart, message => this.onChallengeStart(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeCancel, message => this.onChallengeCancel(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeSuccess, message => this.onChallengeSuccess(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    getPreAuthUser(credentialType) {
        let request = {
            userId: this.vm.user.userId,
            credentialType: credentialType,
            access_token: this.vm.user.access_token
        };
        return this.userService.getPreAuthUser(request)
            .then(response => {
                this.vm.user.fromJson(response);
                return response;
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('get-user_error');
            });
    }

    onChallengeStart(message) {
        if (message) {
            this.challengePreAuthUser(message.credentialType, message.label)
                .then(response => {
                    this.eventAggregator.publish(new ChallengeReceived(response));
                });
        }
    }

    challengePreAuthUser(credentialType, label) {
        let request = {
            userId: this.vm.user.userId,
            credentialType: credentialType,
            access_token: this.vm.user.access_token
        };
        if (label) {
            request.label = label;
        }
        return this.userService.challengePreAuthUser(request)
            .then(response => {
                if (response.challengeStatus !== 'Deny') {
                    this.vm.user.fromJson(response);
                    return response;
                } else {
                    this.notification.error('challenge-user_error');
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('challenge-user_error');
            });
    }

    onChallengeVerify(message) {
        if (message) {
            this.authenticatePreAuthUser(message.credentialType, message.credentials)
                .then(response => {
                    this.eventAggregator.publish(new ChallengeVerify(response));
                });
        }
    }

    authenticatePreAuthUser(credentialType, credentials) {
        let request = {
            userId: this.vm.user.userId,
            credentialType: credentialType,
            credentials: credentials,
            access_token: this.vm.user.access_token
        };
        return this.userService.authenticatePreAuthUser(request)
            .then(response => {
                return response;
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('verify-phone-info_error');
                reject(reason);
            });
    }

    onChallengeCancel() {
        this.eventAggregator.publish(new GoToLogout());
    }

    onChallengeSuccess(message) {
        this.eventAggregator.publish(new AuthenticateUserSuccess(message));
    }

    onChallengeFail(message) {
        this.vm.user.sessionId = '';
        this.vm.user.transactionId = '';
        this.eventAggregator.publish(new AuthenticateUserFail(message));
    }
}
