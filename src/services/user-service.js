import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {Notification} from 'aurelia-notification';
import {Router} from 'aurelia-router';
import {Config} from 'aurelia-api';
import {AuthService} from 'aurelia-authentication';
import {logger} from 'util/logger-helper';
import {DeviceHelper} from 'util/device-helper';

@inject(Config, DeviceHelper, Router, Notification, AuthService)
export class UserService {
    isRequesting = false;

    constructor(config, deviceHelper) {
        this.userEndpoint = config.getEndpoint("user");
        this.deviceHelper = deviceHelper;
    }

    signin(request) {
        this._pre(request);
        return this.userEndpoint.post('signin', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    analyzePreAuthUser(request) {
        this._pre(request);
        return this.userEndpoint.post('analyzepreauthuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    challengePreAuthUser(request) {
        this._pre(request);
        return this.userEndpoint.post('challengepreauthuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    challengeUser(request) {
        this._pre(request);
        return this.userEndpoint.post('challengeuser', request)
            .then(response => {
                this._post(response);
            });
    }

    authenticatePreAuthUser(request) {
        this._pre(request);
        return this.userEndpoint.post('authenticatepreauthuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    authenticateUser(request) {
        this._pre(request);
        return this.userEndpoint.post('authenticateuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    getPreAuthUser(request) {
        this._pre(request);
        return this.userEndpoint.post('getpreauthuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    getUser(request) {
        this._pre(request);
        return this.userEndpoint.post('getuser', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    addChallengeQuestionAnswers(request) {
        this._pre(request);
        return this.userEndpoint.post('addchallengequestionanswers', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    verifyContactInfo(request) {
        this._pre(request);
        return this.userEndpoint.post('verifycontactinfo', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    removeContactInfo(request) {
        this._pre(request);
        return this.userEndpoint.post('removecontactinfo', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    resetPassword(request) {
        this._pre(request);
        return this.userEndpoint.post('resetcredentials', request)
            .then(response => {
                this._post(response);
                return response;
            });
    }

    _pre(request) {
        this.isRequesting = true;
        if (request) {
            request.deviceRequest = this.deviceHelper.deviceRequest;
        }
    }

    _post(response) {
        if (response && response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
            this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
        }
        this.isRequesting = false;
    }
}
