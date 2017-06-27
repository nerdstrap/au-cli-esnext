import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {User} from 'models/user';
import {logger} from 'util/logger-helper';
import {
    EnrollmentDisclaimerConfirmed,
    EnrollmentStart,
    EnrollCredentialsComplete,
    EnrollmentComplete
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class Enrollment {
    vm = {
        user: new User()
    };
    enrollmentViewModel;
    subscribers = [];

    constructor(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;

        let payload = authService.getTokenPayload();
        this.vm.user.fromJson(payload);
    }

    activate(params, routeConfig, navigationInstruction) {
        let request = {
            sessionId: this.vm.user.sessionId,
            transactionId: this.vm.user.transactionId,
            userId: this.vm.user.userId
        };
        return this.userService.getUser(request)
            .then(response => {
                this.vm.user.fromJson(response);
                this.enrollmentViewModel = './enrollment-disclaimer';
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('get-user_error');
            });
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollmentDisclaimerConfirmed, message => this.onEnrollmentDisclaimerConfirmed(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollmentStart, message => this.onEnrollmentStart(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollCredentialsComplete, message => this.onEnrollCredentialsComplete(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollmentComplete, message => this.onEnrollmentComplete(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    onEnrollmentDisclaimerConfirmed(message) {
        this.enrollmentViewModel = './enrollment-intro';
    }

    onEnrollmentStart(message) {
        this.enrollmentViewModel = './enroll-credentials';
    }

    onEnrollCredentialsComplete(message) {
        this.enrollmentViewModel = './enrollment-review';
    }

    onEnrollmentComplete(message) {
        this.router.navigateToRoute('self-service');
    }
}
