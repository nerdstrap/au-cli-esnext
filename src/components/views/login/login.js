import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {User} from 'models/user';
import {
    GoToLogin,
    SigninSuccess,
    AuthenticateUserSuccess,
    GoToForgotPassword
} from 'resources/messages/login-messages';
import {
    GoToChallengeWithCredentials
} from 'resources/messages/challenge-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class Login {
    vm = {
        user: {},
        userIdHasFocus: true,
        credentialsHasFocus: false,
        selectedCredentialType: null
    };
    loginViewModel;
    subscribers = [];

    constructor(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;

        this.loginViewModel = './network-credentials';
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToLogin, message => this.onGoToLogin(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(SigninSuccess, message => this.onSigninSuccess(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(AuthenticateUserSuccess, message => this.onAuthenticateUserSuccess(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToChallengeWithCredentials, message => this.onGoToChallengeWithCredentials(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToForgotPassword, message => this.onGoToForgotPassword(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    onGoToLogin(message) {
        this.router.navigateToRoute('logout');
    }

    onSigninSuccess(message) {
        if (message && message.authStatusCode === 'Challenge' && message.userStatus === 'Enrolled') {
            this.vm.user = new User(message);
            this.loginViewModel = './challenge';
        } else if (message.authStatusCode === 'Success' && message.userStatus === 'Enrolled') {
            this.onAuthenticateUserSuccess(message);
        } else if (message.authStatusCode === 'Success') {
            this.router.navigateToRoute('enrollment');
        } else {
            this.loginViewModel = './deny';
        }
    }

    onGoToChallengeWithCredentials() {
        this.loginViewModel = './challenge-with-credentials';
    }

    onAuthenticateUserSuccess(message) {
        this.authService.setResponseObject({token: message.authToken});
        this.router.navigateToRoute('self-service');
    }

    onGoToForgotPassword(message) {
        this.router.navigateToRoute('forgot-password');
    }
}
