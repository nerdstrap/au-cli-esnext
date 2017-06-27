import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {
    GoToLogout,
    ChallengeWithCredentials
} from 'resources/messages/login-messages';
import {logger} from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class Challenge {
    vm;

    constructor(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            this.vm.bindDeviceOptions = ['yes', 'no'];
            this.applyValidationRules();
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('selectedCredentialType').required()
            .on(this.vm);
    }

    cancel(event) {
        return new Promise(resolve => {
            this.eventAggregator.publish(new GoToLogout());
            resolve();
        });
    }

    next(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish(new ChallengeWithCredentials());
                    }
                    resolve();
                })
                .catch(reason => {
                    logger.error(reason);
                    reject(reason);
                })
        });
    }
}
