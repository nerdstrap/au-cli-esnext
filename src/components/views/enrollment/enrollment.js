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
import {EnrollmentStep} from 'util/common-models';
import {
    GoToEnrollmentDisclaimer,
    GoToEnrollmentIntro,
    GoToChallengeQuestionAnswers,
    ChallengeQuestionAnswersDone,
    GoToPhoneInfos,
    PhoneInfosDone,
    GoToEmailInfos,
    EmailInfosDone,
    GoToEnrollmentSummary,
    EnrollmentDone
} from 'resources/messages/enrollment-messages';
import _ from 'lodash';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class Enrollment {
    vm = {
        user: {},
        showNavBar: false,
        confirmDisclaimerChecked: false,
        remainingTime: 0,
        eventTimerExpired: false
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
        this.vm.user.userId = payload ? payload.username : null;
    }

    activate(params, routeConfig, navigationInstruction) {
        let request = {
            sessionId: this.vm.user.sessionId,
            transactionId: this.vm.user.transactionId,
            userId: this.vm.user.userId
        };
        return this.userService.getUser(request)
            .then(response => {
                this.vm.user = new User();
                this.vm.user.fromJson(response);
                this.onGoToEnrollmentIntro(response);
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('get-user_error');
            });
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToEnrollmentDisclaimer, message => this.onGoToEnrollmentDisclaimer(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToEnrollmentIntro, message => this.onGoToEnrollmentIntro(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToChallengeQuestionAnswers, message => this.onGoToEnrollChallengeQuestionAnswers(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(ChallengeQuestionAnswersDone, message => this.onEnrollChallengeQuestionAnswersDone(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToPhoneInfos, message => this.onGoToEnrollPhoneInfos(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(PhoneInfosDone, message => this.onEnrollPhoneInfosDone(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToEmailInfos, message => this.onGoToEnrollEmailInfos(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EmailInfosDone, message => this.onEnrollEmailInfosDone(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(GoToEnrollmentSummary, message => this.onGoToEnrollmentSummary(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe(EnrollmentDone, message => this.onEnrollmentDone(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    onGoToEnrollmentDisclaimer(message) {
        this.vm.showNavBar = false;
        this.vm.enrollmentStep = EnrollmentStep.DISCLAIMER;
        this.enrollmentViewModel = './enrollment-disclaimer';
    }

    onGoToEnrollmentIntro(message) {
        this.vm.showNavBar = false;
        this.vm.enrollmentStep = EnrollmentStep.INTRO;
        this.enrollmentViewModel = './enrollment-intro';
    }

    onGoToEnrollChallengeQuestionAnswers(message) {
        this.vm.showNavBar = true;
        this.vm.enrollmentStep = EnrollmentStep.QUESTIONS;
        this.enrollmentViewModel = './enroll-challenge-question-answers';
    }

    onEnrollChallengeQuestionAnswersDone(message) {
        this.vm.challengeQuestionAnswersComplete = this.vm.user.challengeQuestionAnswersComplete;
        this.onGoToEnrollPhoneInfos();
    }

    onGoToEnrollPhoneInfos(message) {
        this.vm.showNavBar = true;
        this.vm.enrollmentStep = EnrollmentStep.PHONE;
        this.enrollmentViewModel = './enroll-phone-infos';
    }

    onEnrollPhoneInfosDone(message) {
        if (this.vm.user.smsInfosComplete) {
            this.vm.phoneInfosComplete = true;
            this.vm.phoneInfosSkipped = false;
        }
        else {
            if (message && message.phoneInfosSkipped) {
                this.vm.phoneInfosComplete = false;
                this.vm.phoneInfosSkipped = true;
            }
        }
        this.onGoToEnrollEmailInfos();
    }

    onGoToEnrollEmailInfos(message) {
        this.vm.showNavBar = true;
        this.vm.enrollmentStep = EnrollmentStep.EMAIL;
        this.enrollmentViewModel = './enroll-email-infos';
    }

    onEnrollEmailInfosDone(message) {
        if (this.vm.user.emailInfosComplete) {
            this.vm.emailInfosComplete = true;
            this.vm.emailInfosSkipped = false;
        }
        else {
            if (message && message.emailInfosSkipped) {
                this.vm.emailInfosComplete = false;
                this.vm.emailInfosSkipped = true;
            }
        }
        this.onGoToEnrollmentSummary();
    }

    onGoToEnrollmentSummary(message) {
        this.vm.showNavBar = false;
        this.vm.enrollmentStep = EnrollmentStep.SUMMARY;
        this.enrollmentViewModel = './enrollment-review';
    }

    onEnrollmentDone(message) {
        this.router.navigateToRoute('self-service');
    }
}
