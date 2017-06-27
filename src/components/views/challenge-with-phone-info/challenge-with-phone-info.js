import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {VerifyPhoneInfoDialog} from 'components/views/verify-phone-info-dialog/verify-phone-info-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';
import {
    ChallengeStart,
    ChallengeReceived,
    ChallengeCancel,
    ChallengeSuccess,
    ChallengeFail,
    ChallengeComplete
} from 'resources/messages/challenge-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithPhoneInfo {
    vm;
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
    }

    activate(viewModel) {
        return new Promise(resolve => {
            this.vm = viewModel;
            this.vm.selectedSmsInfo = null;
            this.applyValidationRules();
            resolve();
        });
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeReceived, message => this.onChallengeReceived(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('selectedSmsInfo').required()
            .on(this.vm);
    }

    cancel(event) {
        return new Promise(resolve => {
            this.eventAggregator.publish(new ChallengeCancel());
            resolve();
        });
    }

    next(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        let message = {
                            credentialType: 'Phone',
                            label: this.vm.selectedSmsInfo.label
                        };
                        this.eventAggregator.publish(new ChallengeStart(message));
                    }
                    resolve();
                })
                .catch(validateReason => {
                    logger.error(validateReason);
                    this.notification.error('challenge_error');
                    reject(validateReason);
                })
        });
    }

    onChallengeReceived(message) {
        let verifyPhoneInfoModel = {
            user: {
                userId: this.vm.user.userId,
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId,
                access_token: this.vm.user.access_token
            },
            verificationCode: '',
            verificationCodeHasFocus: true
        };
        verifyPhoneInfoModel.messageParams = {
            'phoneNumber': this.vm.selectedSmsInfo.phoneNumber
        };
        return this.dialogService.open({
            viewModel: VerifyPhoneInfoDialog,
            model: verifyPhoneInfoModel,
            rejectOnCancel: false
        })
            .whenClosed(openDialogResult => {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        this.notification.info('verify-phone-info_resend');
                        this.next();
                    } else {
                        this.notification.info('verify-phone-info_canceled');
                    }
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.info('verify-phone-info_error');
            });
    }
}
