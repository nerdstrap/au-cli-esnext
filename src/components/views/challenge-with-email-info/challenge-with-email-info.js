import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {VerifyEmailInfoDialog} from 'components/views/verify-email-info-dialog/verify-email-info-dialog';
import {
    ChallengeCancel,
    ChallengeSuccess,
    ChallengeFail
} from 'resources/messages/challenge-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService)
export class ChallengeWithEmailInfo {
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
        return new Promise((resolve, reject) => {
            this.vm = viewModel;
            let request = {
                userId: this.vm.user.userId,
                token: this.vm.user.token
            };
            this.userService.getPreAuthUser(request)
                .then(response => {
                    this.vm.user.fromJson(response);
                    resolve();
                })
                .catch(reason => {
                    logger.error(reason);
                    this.notification.error('get-user_error');
                    reject(reason);
                });
        });
    }

    cancel(message) {
        this.eventAggregator.publish(new ChallengeCancel());
    }

    challengeUser(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        let request = {
                            userId: this.vm.user.userId,
                            credentialType: 'Email',
                            contactInfo: this.vm.emailAddress,
                            label: this.vm.emailAddress,
                            isDefault: true
                        };
                        this.userService.challengeUser(request)
                            .then(response => {
                                this.vm.user.sessionId = response.sessionId;
                                this.vm.user.transactionId = response.transactionId;
                                if (response.challengeStatus !== 'Deny') {
                                    this.goToVerifyEmailInfo(response);
                                } else {
                                    this.notification.error('challenge-user-deny_error');
                                }
                                resolve();
                            })
                            .catch(reason => {
                                logger.error(reason);
                                this.notification.error('challenge-user_error');
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

    goToVerifyEmailInfo(message) {
        let verifyEmailInfoModel = {
            user: {
                userId: this.vm.user.userId,
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId
            },
            verificationCode: '',
            verificationCodeHasFocus: true
        };
        verifyEmailInfoModel.messageParams = {
            'emailAddress': this.vm.emailAddress
        };
        return this.dialogService.open({viewModel: VerifyEmailInfoDialog, model: verifyEmailInfoModel, rejectOnCancel: false})
            .whenClosed(openDialogResult => {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        this.notification.info('verify-email-info_resend');
                        this.challengeUser();
                    } else {
                        this.notification.info('verify-email-info_canceled');
                    }
                } else {
                    this.onChallengeSuccess(openDialogResult.output)
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.info('verify-email-info_error');
            });
    }

    onChallengeSuccess(message) {
        this.eventAggregator.publish(new ChallengeSuccess(message));
    }

    onChallengeFail(message) {
        this.eventAggregator.publish(new ChallengeFail(message));
    }
}
