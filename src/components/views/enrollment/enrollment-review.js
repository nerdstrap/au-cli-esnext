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
import {ConfirmDialog} from 'components/views/confirm-dialog/confirm-dialog';
import {
    EnrollmentDone
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class EnrollmentReview {
    vm = {};

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
            resolve();
        });
    }

    goToEnrollChallengeQuestionAnswers(event) {
        this.router.navigateToRoute('edit-challenge-question-answers');
    }

    goToEnrollPhoneInfos(event) {
        this.router.navigateToRoute('edit-phone-infos');
    }

    goToEnrollEmailInfos(event) {
        this.router.navigateToRoute('edit-email-infos');
    }

    done(event) {
        return new Promise((resolve, reject) => {
            if (this.vm.challengeQuestionAnswersComplete &&
                this.vm.user.smsInfosComplete &&
                this.vm.user.emailInfosComplete) {
                this.eventAggregator.publish(new EnrollmentDone());
                resolve();
            } else {
                let confirmDialogModel = {
                    "headerIcon": "dialog-enroll-review-warning.header-icon",
                    "headerText": "dialog-enroll-review-warning.header-text",
                    "message": "dialog-enroll-review-warning.message",
                    "cancelButtonStyle": "dialog-enroll-review-warning.cancel-button-style",
                    "cancelButtonText": "dialog-enroll-review-warning.cancel-button-text",
                    "confirmButtonStyle": "dialog-enroll-review-warning.confirm-button-style",
                    "confirmButtonText": "dialog-enroll-review-warning.confirm-button-text"
                };
                this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel})
                    .then(openDialogResult => {
                        if (!openDialogResult.wasCancelled) {
                            this.eventAggregator.publish(new EnrollmentDone());
                            resolve();
                        } else {
                            reject(new Error('confirm_canceled'));
                        }
                    })
                    .catch(reason => {
                        logger.error(reason);
                        this.notification.error('confirm_error');
                        reject(reason);
                    });

            }
        });
    }

}
