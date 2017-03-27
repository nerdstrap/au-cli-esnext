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
import {ConfirmDialog} from 'components/views/confirm-dialog/confirm-dialog';
import {VerifyEmailInfoDialog} from 'components/views/verify-email-info-dialog/verify-email-info-dialog';
import {EnrollEmailInfosDone} from 'resources/messages/enrollment-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService, WindowHelper)
export class EnrollEmailInfos {
    vm = {
        user: {
            emailInfos: [],
        },
        showEnrollEmailInfoWarning: true,
        emailAddress: '',
        emailAddressHasFocus: true,
        showAddEmailInfoForm: true
    };
    onKeypressInputCallback;

    constructor(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
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
            this.vm.user = viewModel.user;
            if (this.vm.user.emailInfos.length > 0) {
                this.vm.showAddEmailInfoForm = false;
            } else {
                this.vm.emailAddressHasFocus = true;
            }
            this.applyValidationRules();
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('emailAddress').required().email().withMessage(`\${$value} is not a valid email address.`)
            .on(this.vm);
    }

    deactivate() {
        this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'email-address-input') {
                    if (event.key === 'Enter') {
                        this.addEmailInfo();
                    }
                }
            }
        }
    }

    removeEmailInfo(event, contactInfo) {
        let confirmDialogModel = this.i18n.tr('confirm-remove-email-info-dialog', {returnObjects: true});
        confirmDialogModel.messageParams = {
            'emailAddress': contactInfo.emailAddress
        };
        return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel})
            .then(openDialogResult => {
                if (!openDialogResult.wasCancelled) {
                    this.onConfirmRemoveEmailInfo(contactInfo);
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('logout_error');
            });
    }

    onConfirmRemoveEmailInfo(contactInfo) {
        let request = {
            userId: this.vm.userId,
            contactType: 'Email',
            contactInfo: contactInfo.emailAddress,
            label: contactInfo.label,
            verified: contactInfo.verified,
            hasActiveToken: contactInfo.hasActiveToken,
            isDefault: true
        };
        return this.userService.removeContactInfo(request)
            .then(response => {
                this.vm.user.sessionId = response.sessionId;
                this.vm.user.transactionId = response.transactionId;
                if (response.success) {
                    this.notification.info('remove-contact-info_success');
                    this.vm.user.emailInfos.splice(_.findIndex(this.vm.user.emailInfos, contactInfo), 1);
                } else {
                    logger.error(response);
                    this.notification.error('remove-contact-info_error');
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('remove-contact-info_error');
            });
    }

    isEmailAddressUnique(emailAddress) {
        let idx = _.findIndex(this.vm.user.emailInfos, function (s) {
            return s.label === emailAddress;
        });
        return idx < 0;
    }

    addEmailInfo(event) {
        return new Promise((resolve, reject) => {
            if (this.isEmailAddressUnique(this.vm.emailAddress)) {
                this.controller.validate()
                    .then(controllerValidateResult => {
                        if (controllerValidateResult.valid) {
                            let request = {
                                userId: this.vm.user.userId,
                                credentialType: 'SMS',
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
                    .catch(exception => {
                        logger.error(exception);
                        reject(exception);
                    });
            } else {
                let duplicateEmailError = new Error('duplicate-email_error');
                this.notification.error(duplicateEmailError);
                reject(duplicateEmailError);
            }
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
        return this.dialogService.open({viewModel: VerifyEmailInfoDialog, model: verifyEmailInfoModel})
            .then(openDialogResult => {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        this.notification.info('verify-email-info_resend');
                        this.addEmailInfo();
                    } else {
                        this.notification.info('verify-email-info_canceled');
                    }
                } else {
                    this.onVerifyEmailInfoSuccess(openDialogResult.output);
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.info('verify-email-info_error');
            });
    }

    onVerifyEmailInfoSuccess(message) {
        let contactInfo = '1' + JSON.parse(JSON.stringify(message.contactInfo));
        let emailInfo = {
            emailAddress: contactInfo,
            label: contactInfo.substring(1, 11),
            isDefault: false,
            verified: true,
            hasActiveToken: false
        };
        this.vm.user.emailInfos.push(emailInfo);

        this.vm.user.sessionId = null;
        this.vm.user.transactionId = null;
        this.vm.emailAddress = '';
        this.vm.emailAddressHasFocus = true;
        this.vm.showAddEmailInfoForm = false;
    }

    showAddEmailInfoForm(event) {
        return new Promise(resolve => {
            this.vm.showAddEmailInfoForm = true;
            resolve();
        });
    }

    get isEmailInfosComplete() {
        return this.vm.user.emailInfosComplete;
    }

    skip(event) {
        let confirmDialogModel = this.i18n.tr('confirm-skip-enroll-email-infos-dialog', {returnObjects: true});
        return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel})
            .then(openDialogResult => {
                if (!openDialogResult.wasCancelled) {
                    this.eventAggregator.publish(new EnrollEmailInfosDone({emailInfosSkipped: true}));
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('confirm_error');
            });
    }

    next(event) {
        return new Promise(resolve => {
            this.eventAggregator.publish(new EnrollEmailInfosDone());
            resolve();
        });
    }
}
