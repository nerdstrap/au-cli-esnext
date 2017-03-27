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
import {VerifyPhoneInfoDialog} from 'components/views/verify-phone-info-dialog/verify-phone-info-dialog';
import {PhoneInfosDone} from 'resources/messages/enrollment-messages';
import {logger} from 'util/logger-helper';
import _ from 'lodash';

@inject(Router, EventAggregator, ValidationControllerFactory, DialogService, Notification, I18N, AuthService, UserService, WindowHelper)
export class EnrollPhoneInfos {
    vm = {
        user: {
            phoneInfos: [],
        },
        showEnrollPhoneInfoWarning: true,
        phoneNumber: '',
        phoneNumberHasFocus: true,
        showAddPhoneInfoForm: true
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
            if (this.vm.user.smsInfos.length > 0) {
                this.vm.showAddPhoneInfoForm = false;
            } else {
                this.vm.phoneNumberHasFocus = true;
            }
            this.applyValidationRules();
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('phoneNumber')
            .required()
            .minLength(10)
            .maxLength(11)
            .matches(/^\D?(\d{3})\D?\D?(\d{3})\D?\D?\D?(\d{4})$/)
            .withMessage(`\${$value} is not a valid phone number.`)
            .on(this.vm);
    }

    deactivate() {
        this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'phone-number-input') {
                    if (event.key === 'Enter') {
                        this.addPhoneInfo();
                    }
                }
            }
        }
    }

    removePhoneInfo(event, contactInfo) {
        let confirmDialogModel = this.i18n.tr('confirm-remove-phone-info-dialog', {returnObjects: true});
        confirmDialogModel.messageParams = {
            'phoneNumber': contactInfo.phoneNumber
        };
        return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel})
            .then(openDialogResult => {
                if (!openDialogResult.wasCancelled) {
                    this.onConfirmRemovePhoneInfo(contactInfo);
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('logout_error');
            });
    }

    onConfirmRemovePhoneInfo(contactInfo) {
        let request = {
            userId: this.vm.userId,
            contactType: 'Phone',
            contactInfo: contactInfo.phoneNumber,
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
                    this.vm.user.smsInfos.splice(_.findIndex(this.vm.user.smsInfos, contactInfo), 1);
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

    isPhoneNumberUnique(phoneNumber) {
        let idx = _.findIndex(this.vm.user.smsInfos, function (s) {
            return s.label === phoneNumber;
        });
        return idx < 0;
    }

    addPhoneInfo(event) {
        return new Promise((resolve, reject) => {
            if (this.isPhoneNumberUnique(this.vm.phoneNumber)) {
                this.controller.validate()
                    .then(controllerValidateResult => {
                        if (controllerValidateResult.valid) {
                            let request = {
                                userId: this.vm.user.userId,
                                credentialType: 'SMS',
                                contactInfo: this.vm.phoneNumber,
                                label: this.vm.phoneNumber,
                                isDefault: true
                            };
                            this.userService.challengeUser(request)
                                .then(response => {
                                    this.vm.user.sessionId = response.sessionId;
                                    this.vm.user.transactionId = response.transactionId;
                                    if (response.challengeStatus !== 'Deny') {
                                        this.goToVerifyPhoneInfo(response);
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
                let duplicatePhoneError = new Error('duplicate-phone_error');
                this.notification.error(duplicatePhoneError);
                reject(duplicatePhoneError);
            }
        });
    }

    goToVerifyPhoneInfo(message) {
        let verifyPhoneInfoModel = {
            user: {
                userId: this.vm.user.userId,
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId
            },
            verificationCode: '',
            verificationCodeHasFocus: true
        };
        verifyPhoneInfoModel.messageParams = {
            'phoneNumber': this.vm.phoneNumber
        };
        return this.dialogService.open({viewModel: VerifyPhoneInfoDialog, model: verifyPhoneInfoModel})
            .then(openDialogResult => {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        this.notification.info('verify-phone-info_resend');
                        this.addPhoneInfo();
                    } else {
                        this.notification.info('verify-phone-info_canceled');
                    }
                } else {
                    this.onVerifyPhoneInfoSuccess(openDialogResult.output);
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.info('verify-phone-info_error');
            });
    }

    onVerifyPhoneInfoSuccess(message) {
        let contactInfo = '1' + JSON.parse(JSON.stringify(message.contactInfo));
        let phoneInfo = {
            phoneNumber: contactInfo,
            label: contactInfo.substring(1, 11),
            isDefault: false,
            verified: true,
            hasActiveToken: false
        };
        this.vm.user.smsInfos.push(phoneInfo);

        this.vm.user.sessionId = null;
        this.vm.user.transactionId = null;
        this.vm.phoneNumber = '';
        this.vm.phoneNumberHasFocus = true;
        this.vm.showAddPhoneInfoForm = false;
    }

    showAddPhoneInfoForm(event) {
        return new Promise(resolve => {
            this.vm.showAddPhoneInfoForm = true;
            resolve();
        });
    }

    get isPhoneInfosComplete() {
        return this.vm.user.phoneInfosComplete;
    }

    skip(event) {
        let confirmDialogModel = this.i18n.tr('confirm-skip-enroll-phone-infos-dialog', {returnObjects: true});
        return this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel})
            .then(openDialogResult => {
                if (!openDialogResult.wasCancelled) {
                    this.eventAggregator.publish(new EnrollPhoneInfosDone({phoneInfosSkipped: true}));
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('confirm_error');
            });
    }

    next(event) {
        return new Promise(resolve => {
            this.eventAggregator.publish(new EnrollPhoneInfosDone());
            resolve();
        });
    }
}
