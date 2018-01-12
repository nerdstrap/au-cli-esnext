import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { DialogService } from 'aurelia-dialog';
import { Notification } from 'aurelia-notification';
import { I18N } from 'aurelia-i18n';
import { AuthService } from 'aurelia-authentication';
import { UserService } from 'services/user-service';
import { logger } from 'util/logger-helper';
import EventTimer from 'util/event-timer';
import appConfig from 'config/app';
import {
    EnrollmentDisclaimerConfirmed
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollmentDisclaimer {
    vm;
    eventTimerStartTime = appConfig.enrollment.confirmDisclaimerEventTimerStartTime || 5;
    eventTimerTickKey = 'enrollment-disclaimer-tick';
    eventTimerTimeoutKey = 'enrollment-disclaimer-timeout';
    subscribers = [];

    constructor(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;

        this.timer = new EventTimer(this.eventAggregator);
    }

    applyValidationRules() {
        ValidationRules
            .ensure('confirmDisclaimerChecked').equals(true)
            .on(this.vm);
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            this.vm.confirmDisclaimerChecked = false;
            this.vm.eventTimerExpired = false;
            this.vm.remainingTime = this.eventTimerStartTime;
            this.timer.start(this.eventTimerStartTime, this.eventTimerTickKey, this.eventTimerTimeoutKey);
            this.applyValidationRules();
            resolve();
        });
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
    }

    onEventTimerTick(startTime) {
        this.vm.remainingTime = startTime;
    }

    onEventTimerTimeout(startTime) {
        this.vm.eventTimerExpired = true;
    }

    next(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(controllerValidateResult => {
                    if (controllerValidateResult.valid) {
                        this.eventAggregator.publish(new EnrollmentDisclaimerConfirmed());
                    }
                    resolve();
                })
                .catch(reason => {
                    logger.error(reason);
                    reject(reason);
                });
        });
    }

}
