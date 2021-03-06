﻿import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {User} from 'models/user';
import {logger} from 'util/logger-helper';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class SelfService {
    vm = {
        user: new User()
    };
    subscribers = [];

    constructor(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;

        let payload = this.authService.getTokenPayload();
        this.vm.user.fromJson(payload);
    }

    activate(params, routeConfig, navigationInstruction) {
        let request = {
            userId: this.vm.user.userId
        };
        return this.userService.getUser(request)
            .then(response => {
                this.vm.user.fromJson(response);
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('get-user_error');
            });
    }

    goToChangePassword(event) {
        this.router.navigateToRoute('change-password');
    }

    goToEditProfile(event) {
        this.router.navigateToRoute('edit-credentials');
    }

    goToUnlockAccount(event) {
        this.router.navigateToRoute('unlock-account');
    }
}
