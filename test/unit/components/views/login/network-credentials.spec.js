//testing
import {Container} from 'aurelia-dependency-injection';
import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';
// dependencies
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {WindowHelper} from 'util/window-helper';
import {
    SigninSuccess,
    GoToForgotPassword
} from 'resources/messages/login-messages';
import {logger} from 'util/logger-helper';
//sut
import {NetworkCredentials} from 'components/views/login/network-credentials';

// mock variables
let mockDeviceTokenCookie = '__deviceTokenCookie';
let mockAuthToken = '__authToken';
let mockDeviceRequest = {
    deviceTokenCookie: mockDeviceTokenCookie
};
let mockSigninResponse = {
    deviceRequest: mockDeviceRequest,
    authToken: mockAuthToken,
    authStatusCode: 'Success'
};

// mock components
let mockRouter = {
    navigateToRoute: () => {
        return true;
    },
};
let mockEventAggregator = {
    subscribe: () => {
        return true;
    },
    publish: () => {
        return true;
    }
};
let mockValidator = {};
let mockValidationController = {
    validate: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({valid: true});
            }, 5);
        });
    }
};
let mockValidationControllerFactory = {
    createForCurrentScope: () => {
        return mockValidationController;
    }
};
let mockDialogService = {};
let mockNotification = {
    success: () => {
        return true;
    },
    error: () => {
        return true;
    }
};
let mockI18n = {};
let mockAuthService = {
    getTokenPayload: () => {
        return mockPayload;
    },
    isAuthenticated: () => {
        return mockIsAuthenticated;
    }
};
let mockUserService = {
    signin: (request) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockSigninResponse);
            }, 5);
        });
    }
};
let mockDeviceHelper = {
    deviceRequest: () => {
        return mockDeviceRequest;
    },
    setDeviceTokenCookie: () => {
        return true;
    },
    deviceTokenCookie: () => {
        return "";
    }
};
let mockWindowHelper = {
    addEventListener: () => {
        return true;
    },
    removeEventListener: () => {
        return true;
    }
};

// system under test
describe('the network credentials class', () => {
    let sut;
    let validatePromise;
    let signinPromise;

    beforeEach(() => {
        spyOn(mockRouter, 'navigateToRoute').and.callThrough();
        spyOn(mockEventAggregator, 'subscribe').and.callThrough();
        spyOn(mockEventAggregator, 'publish').and.callThrough();
        spyOn(mockValidationControllerFactory, 'createForCurrentScope').and.callThrough();
        spyOn(mockValidationController, 'validate').and.callThrough();
        validatePromise = mockValidationController.validate();
        //mockDialogService
        //mockNotification
        //mockI18N
        //mockAuthService
        spyOn(mockUserService, 'signin').and.callThrough();
        signinPromise = mockUserService.signin();
        spyOn(mockWindowHelper, 'addEventListener').and.callThrough();
        spyOn(mockWindowHelper, 'removeEventListener').and.callThrough();

        spyOn(NetworkCredentials.prototype, 'applyValidationRules');
        sut = new NetworkCredentials(mockRouter, mockEventAggregator, mockValidationControllerFactory, mockDialogService, mockNotification, mockI18n, mockAuthService, mockUserService, mockWindowHelper);
    });

    it('constructor', done => {
        expect(sut).toBeDefined();
        expect(sut.router).toBeDefined();
        expect(sut.eventAggregator).toBeDefined();
        expect(sut.controller).toBeDefined();
        expect(mockValidationControllerFactory.createForCurrentScope).toHaveBeenCalled();
        expect(sut.controller.validateTrigger).toEqual(validateTrigger.manual);
        expect(sut.dialogService).toBeDefined();
        expect(sut.notification).toBeDefined();
        expect(sut.i18n).toBeDefined();
        expect(sut.authService).toBeDefined();
        expect(sut.userService).toBeDefined();
        expect(sut.windowHelper).toBeDefined();
        expect(sut.onKeypressInputCallback).toBeDefined();

        done();
    });

    it('has promises', function () {
        expect(validatePromise).toEqual(jasmine.any(Promise));
        expect(signinPromise).toEqual(jasmine.any(Promise));
    });

    describe('.activate', () => {

        it('should call addEventListener', done => {
            let viewModel = {};
            sut.activate(viewModel);
            expect(sut.applyValidationRules).toHaveBeenCalled();
            expect(mockWindowHelper.addEventListener).toHaveBeenCalled();
            done();
        });

    });

    describe('.deactivate', () => {

        it('should call removeEventListener', done => {
            sut.deactivate();
            expect(mockWindowHelper.removeEventListener).toHaveBeenCalled();
            done();
        });

    });

    describe('.onKeypressInput', function () {

        it('should call signin', function (done) {
            spyOn(sut, 'signin');

            let event = {
                target: {
                    id: 'credentials-input'
                },
                key: 'Enter'
            };
            sut.onKeypressInput(event);
            expect(sut.signin).toHaveBeenCalled();
            done();
        });
    });

    describe('.signin', function () {

        it('should resolve', function (done) {
            let event = {};
            sut.signin(event)
                .then(response => {
                    expect(mockValidationController.validate).toHaveBeenCalled();
                    expect(mockUserService.signin).toHaveBeenCalled();
                    done();
                })
                .catch(reason => {
                    done();
                });
        });
    });

    describe('.goToForgotPassword', function () {

        it('should call eventAggregator.publish', function (done) {
            let event = {};
            sut.goToForgotPassword(event);
            expect(mockEventAggregator.publish).toHaveBeenCalled();
            done();
        });
    });

});

// framework activation
describe('the network credentials component', () => {
    let container;
    let component;

    beforeEach(() => {
        spyOn(mockEventAggregator, 'subscribe').and.callThrough();
        spyOn(mockUserService, 'signin').and.callThrough();
        spyOn(mockWindowHelper, 'addEventListener').and.callThrough();
        spyOn(mockWindowHelper, 'removeEventListener').and.callThrough();

        container = new Container().makeGlobal();
        component = StageComponent
            .withResources('components/views/login/network-credentials')
            .inView('<network-credentials></network-credentials>');

        component.bootstrap(aurelia => {
            aurelia.use
                .standardConfiguration()
                .feature('foundation-validation')
                .plugin('aurelia-validation');

            aurelia.container.registerInstance(Router, mockRouter);
            aurelia.container.registerInstance(EventAggregator, mockEventAggregator);
            aurelia.container.registerInstance(DialogService, mockDialogService);
            aurelia.container.registerInstance(Notification, mockNotification);
            aurelia.container.registerInstance(I18N, mockI18n);
            aurelia.container.registerInstance(AuthService, mockAuthService);
            aurelia.container.registerInstance(UserService, mockUserService);
            aurelia.container.registerInstance(WindowHelper, mockWindowHelper);
        });
    });

    it('.create', done => {
        component.create(bootstrap)
            .then(() => {
                expect(component.viewModel).toBeDefined();
                expect(component.viewModel.router).toBeDefined();
                expect(component.viewModel.eventAggregator).toBeDefined();
                expect(component.viewModel.controller).toBeDefined();
                expect(component.viewModel.dialogService).toBeDefined();
                expect(component.viewModel.notification).toBeDefined();
                expect(component.viewModel.i18n).toBeDefined();
                expect(component.viewModel.authService).toBeDefined();
                expect(component.viewModel.userService).toBeDefined();
                expect(component.viewModel.windowHelper).toBeDefined();
                done();
            });
    });

    afterEach(() => {
        component.dispose();
    });
});

