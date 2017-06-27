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
    ChallengeVerify,
    ChallengeSuccess,
    ChallengeFail,
    ChallengeComplete
} from 'resources/messages/challenge-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithChallengeQuestions {
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
        return new Promise(resolve => {
            this.vm = viewModel;
            resolve();
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
                .then(result => {
                    if (result.valid) {
                        let credentials = this._getCredentials();
                        let message = {
                            credentialType: 'Questions',
                            credentials: credentials
                        };
                        this.eventAggregator.publish(new ChallengeVerify(message));
                    }
                    resolve();
                })
                .catch(validateReason => {
                    logger.error(validateReason);
                    this.notification.error('challenge_error');
                    reject(validateReason);
                });
        });

    }
}
