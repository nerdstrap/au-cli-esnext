import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Config} from 'aurelia-api';
import {logger} from 'util/logger-helper';
import {DeviceHelper} from 'util/device-helper';

@inject(Config, DeviceHelper)
export class UserService {
    isRequesting = false;

    constructor(config, deviceHelper) {
        this.userEndpoint = config.getEndpoint("user");
        this.deviceHelper = deviceHelper;
    }

    signin(signinRequest) {
        this.isRequesting = true;
        signinRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('signin', signinRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    analyzeUser(analyzeUserRequest) {
        this.isRequesting = true;
        analyzeUserRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('analyzeuser', analyzeUserRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    challengeUser(challengeUserRequest) {
        this.isRequesting = true;
        challengeUserRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('challengeuser', challengeUserRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    authenticateUser(authenticateUserRequest) {
        this.isRequesting = true;
        authenticateUserRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('authenticateuser', authenticateUserRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    getUser(getUserRequest) {
        this.isRequesting = true;
        getUserRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('getuser', getUserRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    addChallengeQuestionAnswers(addChallengeQuestionAnswersRequest) {
        this.isRequesting = true;
        addChallengeQuestionAnswersRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('addchallengequestionanswers', addChallengeQuestionAnswersRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    verifyContactInfo(verifyContactInfoRequest) {
        this.isRequesting = true;
        verifyContactInfoRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('verifycontactinfo', verifyContactInfoRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    removeContactInfo(removeContactInfoRequest) {
        this.isRequesting = true;
        removeContactInfoRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('removecontactinfo', removeContactInfoRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }

    resetPassword(resetPasswordRequest) {
        this.isRequesting = true;
        resetPasswordRequest.deviceRequest = this.deviceHelper.deviceRequest;
        return this.userEndpoint.post('resetcredentials', resetPasswordRequest)
            .then(response => {
                this.isRequesting = false;
                if (response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                    this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
                }
                return response;
            });
    }
}
