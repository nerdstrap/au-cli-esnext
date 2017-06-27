import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';
import {
    ChallengeCancel,
    ChallengeSuccess,
    ChallengeFail
} from 'resources/messages/challenge-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithRSAToken {
    vm;

    constructor(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
    }

    activate(viewModel) {
        return new Promise((resolve, reject) => {
            this.vm = viewModel;
            let request = {
                userId: this.vm.user.userId,
                credentialType: 'Questions',
                authToken: this.vm.authToken
            };
            this.userService.challengeUser(request)
                .then(response => {
                    if (response.challengeStatus !== 'Deny') {
                        this.vm.user.fromJson(response);
                        this.applyValidationRules();
                    } else {
                        this.notification.error('challenge-user_error');
                    }
                    resolve();
                })
                .catch(reason => {
                    logger.error(reason);
                    this.notification.error('challenge-user_error');
                    reject(reason);
                });
        });
    }

    applyValidationRules() {
        for (let i = 0; i < this.vm.user.challengeQuestions.length; i++) {
            let challengeQuestion = this.vm.user.challengeQuestions[i];
            ValidationRules
                .ensure('userAnswerText').required()
                .on(challengeQuestion);
        }
    }

    onSelectedAvailableChallengeQuestionAnswerChanged(event, bindingContext, selectedAvailableChallengeQuestion) {
        this.vm.user.updateAvailableChallengeQuestions(bindingContext.challengeQuestion, selectedAvailableChallengeQuestion);
    }

    cancel(event) {
        return new Promise(resolve => {
            this.eventAggregator.publish(new ChallengeCancel());
            resolve();
        });
    }

    _getCredentials() {
        let credentials = '';
        for (let challengeQuestion of this.vm.user.challengeQuestions) {
            if (challengeQuestion.userAnswerText !== null || challengeQuestion.userAnswerText.length >= 0) {
                credentials = credentials + challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId + '|' + challengeQuestion.userAnswerText + ',';
            }
        }
        credentials = _.trimEnd(credentials, ',');
        return credentials;
    }

    next() {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(controllerValidateResult => {
                    if (controllerValidateResult.valid) {
                        let credentials = this._getCredentials();
                        let request = {
                            sessionId: this.vm.user.sessionId,
                            transactionId: this.vm.user.transactionId,
                            userId: this.vm.user.userId,
                            authToken: this.vm.user.authToken,
                            credentialType: 'Questions',
                            credentials: credentials,
                            bindDevice: this.vm.bindDevice
                        };
                        this.userService.authenticateUser(request)
                            .then(response => {
                                if (response.authStatusCode !== 'Deny') {
                                    this.onChallengeSuccess(response);
                                } else {
                                    this.notification.error('challenge_error');
                                    this.onChallengeFail(response);
                                }
                                resolve();
                            })
                            .catch(reason => {
                                logger.error(reason);
                                this.notification.error('challenge_error');
                                reject(reason);
                            });
                    } else {
                        resolve();
                    }
                })
                .catch(validateReason => {
                    logger.error(validateReason);
                    this.notification.error('challenge_error');
                    reject(validateReason);
                });
        });

    }

    onChallengeSuccess(message) {
        this.eventAggregator.publish(new ChallengeSuccess(message));
    }

    onChallengeFail(message) {
        this.eventAggregator.publish(new ChallengeFail(message));
    }
}
