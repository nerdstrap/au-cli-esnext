import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules} from 'aurelia-validation';
import {DialogController} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {WindowHelper} from 'util/window-helper';
import {logger} from 'util/logger-helper';
import EventTimer from 'util/event-timer';
import appConfig from 'config/app';
import _ from 'lodash';

@inject(DialogController, EventAggregator, ValidationControllerFactory, Notification, I18N, AuthService, UserService, WindowHelper)
export class VerifyEmailInfoDialog {
    vm;
    onKeypressInputCallback;
    eventTimerStartTime = appConfig.enrollment.verifyEmailInfoTimerStartTime || 120;
    eventTimerTickKey = 'verify-email-info_tick';
    eventTimerTimeoutKey = 'verify-email-info_timeout';
    subscribers = [];

    constructor(dialogController, eventAggregator, controllerFactory, notification, i18n, authService, userService, windowHelper) {
        this.dialogController = dialogController;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
        this.windowHelper = windowHelper;

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
        this.timer = new EventTimer(this.eventAggregator);
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            this.applyValidationRules();
            this.vm.remainingTime = this.eventTimerStartTime;
            this.timer.start(this.eventTimerStartTime, this.eventTimerTickKey, this.eventTimerTimeoutKey);

            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('verificationCode').required().minLength(8).maxLength(8)
            .on(this.vm);
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(this.eventTimerTickKey, startTime => this.onEventTimerTick(startTime))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(this.eventTimerTimeoutKey, startTime => this.onEventTimerTimeout(startTime))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    deactivate() {
        this.timer.stop();
        this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'verification-code') {
                    if (event.key === 'Enter') {
                        this.verify();
                    }
                }
            }
        }
    }

    onEventTimerTick(startTime) {
        this.vm.remainingTime = startTime;
    }

    onEventTimerTimeout(startTime) {
        this.vm.eventTimerExpired = true;
    }

    cancel(event) {
        this.dialogController.cancel();
    }

    resendCode(event) {
        let response = {
            resendCode: true
        };
        this.dialogController.cancel(response);
    }

    verify(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(controllerValidateResult => {
                    if (controllerValidateResult.valid) {
                        let request = {
                            sessionId: this.vm.user.sessionId,
                            transactionId: this.vm.user.transactionId,
                            userId: this.vm.user.userId,
                            contactType: 'Email',
                            contactInfo: this.vm.emailAddress,
                            label: this.vm.emailAddress,
                            token: this.vm.verificationCode
                        };
                        this.userService.verifyContactInfo(request)
                            .then(response => {
                                if (response.verified) {
                                    this.dialogController.ok(response);
                                } else {
                                    this.notification.error('verify-email-info-fail_error');
                                }
                                resolve();
                            })
                            .catch(reason => {
                                logger.error(reason);
                                this.notification.error('verify-email-info_error');
                                reject(reason);
                            });
                    }
                });
        });
    }
}
