import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {WindowHelper} from 'util/window-helper';
import {
    SigninSuccess,
    GoToForgotPassword
} from 'resources/messages/login-messages';
import {logger} from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService, WindowHelper)
export class NetworkCredentials {
    vm = {};
    onKeypressInputCallback;

    constructor(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
        this.windowHelper = windowHelper;

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            this.applyValidationRules();
            this.vm.userIdHasFocus = true;
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('userId').required().minLength(1).maxLength(256)
            .ensure('credentials').required().minLength(1).maxLength(256)
            .on(this.vm.user);
    }

    deactivate() {
        this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'credentials-input') {
                    if (event.key === 'Enter') {
                        this.signin();
                    }
                }
            }
        }
    }

    signin(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(controllerValidateResult => {
                    if (controllerValidateResult.valid) {
                        let request = {
                            sessionId: this.vm.user.sessionId,
                            transactionId: this.vm.user.transactionId,
                            userId: this.vm.user.userId,
                            credentials: this.vm.user.credentials
                        };
                        this.userService.signin(request)
                            .then(response => {
                                this.eventAggregator.publish(new SigninSuccess(response));
                                resolve();
                            })
                            .catch(reason => { 
                                logger.error(reason);
                                reject(reason);
                            });
                    } else {
                        resolve();
                    }
                })
            .catch(validateReason => {
                logger.error(validateReason);
                reject(validateReason);
            })
        });
    }

    goToForgotPassword(event) {
        this.eventAggregator.publish(new GoToForgotPassword());
    }
}
