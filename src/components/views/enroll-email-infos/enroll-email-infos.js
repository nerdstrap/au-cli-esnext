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
import {
    EnrollEmailInfosComplete
} from 'resources/messages/enrollment-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService, WindowHelper)
export class EnrollEmailInfos {
    vm;
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
            this.vm.showEnrollEmailInfoWarning = true;
            this.vm.emailAddress = '';
            this.vm.emailAddressHasFocus = true;
            this.vm.showAddEmailInfoForm = true;
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
        return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false})
            .whenClosed(openDialogResult => {
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
                this.notification.info('remove-contact-info_success');
                this.vm.user.emailInfos.splice(_.findIndex(this.vm.user.emailInfos, contactInfo), 1);
                this.eventAggregator.publish(new EnrollEmailInfosComplete());
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
        return this.dialogService.open({viewModel: VerifyEmailInfoDialog, model: verifyEmailInfoModel, rejectOnCancel: false})
            .whenClosed(openDialogResult => {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        this.notification.info('verify-email-info_resend');
                        this.addEmailInfo();
                    } else {
                        this.notification.info('verify-email-info_canceled');
                    }
                } else {
                    this.onVerifyEmailInfoSuccess(openDialogResult.output);
                    this.eventAggregator.publish(new EnrollEmailInfosComplete());

                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.info('verify-email-info_error');
            });
    }

    onVerifyEmailInfoSuccess(message) {
        if (message) {
            let emailInfo = {
                emailAddress: message.contactInfo,
                label: message.contactInfo,
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
    }
}
