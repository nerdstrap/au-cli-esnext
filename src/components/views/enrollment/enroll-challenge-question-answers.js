import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';
import {EnrollChallengeQuestionAnswersDone, GoToEnrollmentIntro} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollChallengeQuestionAnswers {
    vm = {
        user: {
            challengeQuestions: [{}, {}, {}, {}, {}]
        }
    };

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
            this.vm.user = viewModel.user;
            this.applyValidationRules();
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
            this.eventAggregator.publish(new GoToEnrollmentIntro());
            resolve();
        });
    }

    next(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(controllerValidateResult => {
                    if (controllerValidateResult.valid) {
                        let challengeQuestionAnswers = this.vm.user.getChallengeQuestionAnswers();
                        let request = {
                            sessionId: this.vm.user.sessionId,
                            transactionId: this.vm.user.transactionId,
                            userId: this.vm.user.userId,
                            challengeQuestionAnswers: challengeQuestionAnswers
                        };
                        this.userService.addChallengeQuestionAnswers(request)
                            .then(response => {
                                this.onAddChallengeQuestionAnswersSuccess();
                                this.notification.success('add-challenge-question-answers_success');
                                this.eventAggregator.publish(new EnrollChallengeQuestionAnswersDone());
                                resolve();
                            })
                            .catch(reason => {
                                logger.error(reason);
                                this.notification.error('add-challenge-question-answers_error');
                                reject(reason);
                            });
                    } else {
                        let validateError = new Error('validate_error');
                        logger.error(validateError);
                        this.notification.error('validate_error');
                        reject(validateError);
                    }
                })
                .catch(exception => {
                    logger.error(exception);
                    reject(exception);
                });
        });
    }

    onAddChallengeQuestionAnswersSuccess(message) {
        let request = {
            sessionId: this.vm.user.sessionId,
            transactionId: this.vm.user.transactionId,
            userId: this.vm.user.userId
        };
        return this.userService.getUser(request)
            .then(response => {
                logger.error('get-user_success');
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('get-user_error');
            });
    }
}
