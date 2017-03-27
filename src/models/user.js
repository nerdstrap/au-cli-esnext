import {ChallengeQuestion} from 'models/challengeQuestion';
import {ChallengeQuestionAnswer} from 'models/challengeQuestionAnswer';
import {SmsInfo} from 'models/smsInfo';
import {EmailInfo} from 'models/emailInfo';
import {AuthStatusCode} from 'util/common-models';
import appConfig from 'config/app';
import _ from 'lodash';

export class User {
    sessionId = '';
    transactionId = '';
    userId = '';
    fullName = '';
    _availableChallengeQuestions = [];
    _challengeQuestionAnswers = [];
    challengeQuestions = [];
    smsInfos = [];
    emailInfos = [];
    availableChallengeCredentialTypes = [];
    numberOfRequiredChallengeQuestionAnswers = appConfig.enrollment.numberOfRequiredChallengeQuestionAnswers || 5;
    numberOfRequiredSmsInfos = appConfig.enrollment.numberOfRequiredSmsInfos || 1;
    numberOfRequiredEmailInfos = appConfig.enrollment.numberOfRequiredEmailInfos || 1;

    constructor(attributes) {
        this.fromJson(attributes);
    }

    fromJson(response) {
        if (response) {
            if (response.authStatusCode) {
                this.authStatusCode = AuthStatusCode[response.authStatusCode];
            }
            if (response.sessionId) {
                this.sessionId = response.sessionId;
            }
            if (response.transactionId) {
                this.transactionId = response.transactionId;
            }
            if (response.userId) {
                this.userId = response.userId;
            }
            if (response.userInfo && response.userInfo.fullName) {
                this.fullName = response.userInfo.fullName;
            }
            if (response.authToken) {
                this.authToken = response.authToken;
            }
            let buildChallengeQuestions = false;
            if (response.availableChallengeQuestionAnswers && response.availableChallengeQuestionAnswers.length && response.availableChallengeQuestionAnswers.length > 0) {
                buildChallengeQuestions = true;
                for (let i = 0; i < response.availableChallengeQuestionAnswers.length; i++) {
                    let newChallengeQuestion = new ChallengeQuestion();
                    newChallengeQuestion.fromJson(response.availableChallengeQuestionAnswers[i]);
                    this._availableChallengeQuestions.push(newChallengeQuestion);
                }
            }
            let mapChallengeQuestionAnswers = false;
            if (response.challengeQuestionAnswers && response.challengeQuestionAnswers.length && response.challengeQuestionAnswers.length > 0) {
                mapChallengeQuestionAnswers = true;
                for (let j = 0; j < response.challengeQuestionAnswers.length; j++) {
                    let newChallengeQuestionAnswer = new ChallengeQuestionAnswer();
                    newChallengeQuestionAnswer.fromJson(response.challengeQuestionAnswers[j]);
                    this._challengeQuestionAnswers.push(newChallengeQuestionAnswer);
                }
            }
            if (response.smsInfos && response.smsInfos.length && response.smsInfos.length > 0) {
                for (let k = 0; k < response.smsInfos.length; k++) {
                    let newSmsInfo = new SmsInfo();
                    newSmsInfo.fromJson(response.smsInfos[k]);
                    this.smsInfos.push(newSmsInfo);
                }
            }
            if (response.emailInfos && response.emailInfos.length && response.emailInfos.length > 0) {
                for (let l = 0; l < response.emailInfos.length; l++) {
                    let newEmailInfo = new EmailInfo();
                    newEmailInfo.fromJson(response.emailInfos[l]);
                    this.emailInfos.push(newEmailInfo);
                }
            }
            if (response.credentialTypes && response.credentialTypes.length && response.credentialTypes.length > 0) {
                for (let m = 0; m < response.credentialTypes.length; m++) {
                    this.availableChallengeCredentialTypes.push(response.credentialTypes[m]);
                }
            }

            if (buildChallengeQuestions) {
                this.buildChallengeQuestions(this.numberOfRequiredChallengeQuestionAnswers);
            }
            if (mapChallengeQuestionAnswers) {
                if (!buildChallengeQuestions) {
                    if (response.challengeQuestionAnswers && response.challengeQuestionAnswers.length && response.challengeQuestionAnswers.length > 0) {
                        for (let n = 0; n < response.challengeQuestionAnswers.length; n++) {
                            let newChallengeQuestion = new ChallengeQuestion();
                            newChallengeQuestion.fromJson(response.challengeQuestionAnswers[n]);
                            this._availableChallengeQuestions.push(newChallengeQuestion);
                        }
                        this.buildChallengeQuestions(response.challengeQuestionAnswers.length);
                    }
                }
                this.mapChallengeQuestionAnswers();
            }
        }
    }

    buildChallengeQuestions(numberOfChallengeQuestions) {
        this.challengeQuestions = [];
        for (let i = 0; i < numberOfChallengeQuestions; i++) {
            this.challengeQuestions.push({
                availableChallengeQuestions: _.orderBy(_.cloneDeep(this._availableChallengeQuestions, ['challengeQuestionId'], ['asc'])),
                selectedAvailableChallengeQuestion: null,
                previouslySelectedAvailableChallengeQuestion: null,
                userAnswerText: '',
                showActualAnswer: false
            });
        }
    }

    updateAvailableChallengeQuestions(selectedChallengeQuestion, selectedAvailableChallengeQuestion) {
        for (let i = 0; i < this.challengeQuestions.length; i++) {
            let currentChallengeQuestion = this.challengeQuestions[i];
            if (currentChallengeQuestion !== selectedChallengeQuestion) {
                let removedAvailableChallengeQuestion;
                if (selectedAvailableChallengeQuestion !== null) {
                    let index = _.findIndex(currentChallengeQuestion.availableChallengeQuestions, selectedAvailableChallengeQuestion);
                    if (index > -1) {
                        removedAvailableChallengeQuestion = currentChallengeQuestion.availableChallengeQuestions.splice(index, 1);
                    }
                }
                if (selectedChallengeQuestion.previouslySelectedAvailableChallengeQuestion !== null) {
                    currentChallengeQuestion.availableChallengeQuestions.splice(0, 0, selectedChallengeQuestion.previouslySelectedAvailableChallengeQuestion);
                }
            }
        }

        selectedChallengeQuestion.previouslySelectedAvailableChallengeQuestion = selectedAvailableChallengeQuestion;
    }

    getChallengeQuestionAnswers() {
        let challengeQuestionAnswers = [];
        for (let i = 0; i < this.challengeQuestions.length; i++) {
            let challengeQuestion = this.challengeQuestions[i];
            if (challengeQuestion && challengeQuestion.selectedAvailableChallengeQuestion && challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId && challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionText && challengeQuestion.userAnswerText) {
                challengeQuestionAnswers.push({
                    challengeQuestionId: challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId,
                    challengeQuestionText: challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionText,
                    userAnswerText: challengeQuestion.userAnswerText
                });
            }
        }
        return challengeQuestionAnswers;
    }

    mapChallengeQuestionAnswers() {
        for (let i = 0; i < this.challengeQuestions.length; i++) {
            let challengeQuestion = this.challengeQuestions[i];
            let challengeQuestionAnswer = this._challengeQuestionAnswers[i];
            if (challengeQuestion && challengeQuestionAnswer) {
                challengeQuestion.selectedAvailableChallengeQuestion = _.find(challengeQuestion.availableChallengeQuestions, function (a) {
                    return a.challengeQuestionId === challengeQuestionAnswer.challengeQuestionId;
                });
                this.updateAvailableChallengeQuestions(challengeQuestion, challengeQuestion.selectedAvailableChallengeQuestion)
            }
        }
    }

    get challengeQuestionAnswersComplete() {
        return this._challengeQuestionAnswers && this._challengeQuestionAnswers.length && this._challengeQuestionAnswers.length >= this.numberOfRequiredChallengeQuestionAnswers;
    }

    get smsInfosComplete() {
        return this.smsInfos && this.smsInfos.length && this.smsInfos.length >= this.numberOfRequiredSmsInfos;
    }

    get emailInfosComplete() {
        let isValid = false;
        if (this.emailInfos && this.emailInfos.length && this.emailInfos.length >= this.numberOfRequiredEmailInfos) {
            if (this.emailInfos.length > 1) {
                isValid = true;
            } else {
                if (!this.emailInfos[0].emailAddress.match('companyname.com')) {
                    isValid = true;
                }
            }
        }
        return isValid;
    }
}
