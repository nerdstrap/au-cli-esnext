define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', 'config/router', 'config/app', 'config/auth', 'config/local', './environment', 'i18next-xhr-backend', 'aurelia-config', 'aurelia-router', 'aurelia-authentication', 'aurelia-validation', 'aurelia-framework', 'aurelia-logging-console'], function (exports, _router, _app, _auth, _local, _environment, _i18nextXhrBackend, _aureliaConfig, _aureliaRouter, _aureliaAuthentication, _aureliaValidation, _aureliaFramework, _aureliaLoggingConsole) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.configure = configure;

    var _router2 = _interopRequireDefault(_router);

    var _app2 = _interopRequireDefault(_app);

    var _auth2 = _interopRequireDefault(_auth);

    var _local2 = _interopRequireDefault(_local);

    var _environment2 = _interopRequireDefault(_environment);

    var _i18nextXhrBackend2 = _interopRequireDefault(_i18nextXhrBackend);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    _aureliaFramework.LogManager.addAppender(new _aureliaLoggingConsole.ConsoleAppender());
    _aureliaFramework.LogManager.setLevel(window.location.hostname.match(new RegExp('localhost')) ? _aureliaFramework.LogManager.logLevel.debug : _aureliaFramework.LogManager.logLevel.error);

    Promise.config({
        warnings: {
            wForgottenReturn: false
        }
    });

    function getLanguage() {
        return new Promise(function (resolve) {
            var lng = 'en';
            resolve(lng);
        });
    }

    function configureRouter(config) {
        config.title = _app2.default.app.title;
        config.addPipelineStep('authorize', _aureliaAuthentication.AuthenticateStep);
        config.map(_router2.default.routes);
        config.fallbackRoute(_router2.default.fallbackRoute);
    }

    function setRoot(aurelia) {
        if (aurelia.setupAureliaDone && aurelia.setupI18NDone) {
            aurelia.container.get(_aureliaRouter.Router).configure(configureRouter);
            aurelia.setRoot('app/app');
        }
    }

    function initialize(aurelia, lng) {
        aurelia.setupAureliaDone = false;
        aurelia.setupI18NDone = false;
        aurelia.use.standardConfiguration().feature('resources').feature('components').plugin('aurelia-validation').plugin('aurelia-ux').plugin('aurelia-config', function (configure) {
            return configure(['aurelia-api', 'aurelia-authentication', 'aurelia-notification'], _app2.default, _auth2.default, _local2.default);
        }).plugin('aurelia-dialog', function (config) {
            config.useDefaults();
            config.useCSS('');
            config.settings.lock = true;
            config.settings.centerHorizontalOnly = false;
            config.settings.startingZIndex = 5;
            config.settings.enableEscClose = true;
            config.settings.rejectOnCancel = true;
        }).plugin('aurelia-i18n', function (instance) {
            instance.i18next.use(_i18nextXhrBackend2.default);
            var language = localStorage.getItem('language');
            instance.setup({
                backend: {
                    loadPath: 'src/locales/{{lng}}/{{ns}}.json'
                },
                lng: language || _app2.default.defaultLocale.language,
                attributes: ['t', 'i18n'],
                fallbackLng: language || _app2.default.defaultLocale.language,
                debug: _app2.default.i18n.debug,
                interpolation: {
                    format: function format(value, _format, lng) {
                        var parts = _format.split(':');
                        var vc = aurelia.resources.valueConverters[parts.shift()];
                        return vc ? vc.toView.apply(vc, [value].concat(parts)) : value;
                    }
                }
            }).then(function () {
                _aureliaValidation.ValidationMessageProvider.prototype.getMessage = function (key) {
                    var translation = instance.i18next.t('validationMessages.' + key);
                    return this.parser.parseMessage(translation);
                };
                _aureliaValidation.ValidationMessageProvider.prototype.getDisplayName = function (propertyName, displayName) {
                    if (displayName !== null && displayName !== undefined) {
                        return displayName;
                    }
                    return instance.i18next.t('inputParameters.' + propertyName);
                };
                aurelia.setupI18NDone = true;
                setRoot(aurelia);
            });
        });

        var mergedConfig = aurelia.container.get(_aureliaConfig.Config);
        if (mergedConfig.fetch('environment') === 'development') {
            aurelia.use.developmentLogging();
        }

        if (mergedConfig.fetch('environment') === 'testing') {
            aurelia.use.plugin('aurelia-testing');
        }

        aurelia.start().then(function () {
            aurelia.setupAureliaDone = true;
            setRoot(aurelia);
        });
    }

    function configure(aurelia) {
        getLanguage().then(function (lang) {
            initialize(aurelia, lang);
        }).catch(function (e) {
            initialize(aurelia, 'en');
        });
    }
});
define('app/app',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-authentication', 'aurelia-ux', 'aurelia-notification', 'aurelia-i18n', 'util/logger-helper', 'jquery', 'foundation-sites'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaAuthentication, _aureliaUx, _aureliaNotification, _aureliaI18n, _loggerHelper, _jquery, _foundationSites) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    var _jquery2 = _interopRequireDefault(_jquery);

    var _foundationSites2 = _interopRequireDefault(_foundationSites);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaAuthentication.AuthService, _aureliaUx.AureliaUX, _aureliaNotification.Notification, _aureliaI18n.I18N), _dec(_class = function () {
        function App(router, authService, ux, notification, i18n) {
            _classCallCheck(this, App);

            this.languages = [{ code: 'en', locale: 'en-US', flag: 'us' }];

            this.router = router;
            this.authService = authService;
            this.ux = ux;
            this.notification = notification;
            this.i18n = i18n;

            var payload = authService.getTokenPayload();
            this.username = payload ? payload.username : null;
            this.authenticated = this.authService.isAuthenticated();
        }

        App.prototype.setLanguage = function setLanguage(language) {
            localStorage.setItem('language', language.code);
            window.top.location.reload();
        };

        App.prototype.attached = function attached() {
            ux.design.primary = '#704794';
            ux.design.accent = '#e62787';
            _loggerHelper.logger.info(this.i18n.tr('welcome_notification'));
            this.notification.info('welcome_notification');
        };

        return App;
    }()) || _class);
});
define('components/index',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.configure = configure;
    function configure(config) {
        config.globalResources(["./nav-bar/nav-bar", "./site-footer/site-footer", "./validation-summary/validation-summary"]);
    }
});
define('config/app',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = {
        app: {
            title: 'Corporation Name - Application Name',
            environment: 'development'
        },
        logger: {
            name: 'au-cli-esnext'
        },
        i18n: {
            debug: true
        },
        'aurelia-api': {
            endpoints: [{
                name: 'user',
                endpoint: 'http://127.0.0.1:1337/user/',

                default: true
            }, {
                name: 'auth',
                endpoint: 'http://127.0.0.1:1337/'
            }]
        },
        defaultLocale: {
            language: 'en',
            locale: 'en-US'
        },
        'aurelia-notification': {
            defaults: {
                timeout: 5000,
                clickToClose: true
            },
            notifications: {
                success: 'humane-flatty-success',
                error: 'humane-flatty-error',
                info: 'humane-flatty-info'
            }
        },
        enrollment: {
            numberOfRequiredChallengeQuestionAnswers: 5,
            numberOfRequiredSmsInfos: 1,
            numberOfRequiredEmailInfos: 1,
            confirmDisclaimerEventTimerStartTime: 1,
            verifyPhoneInfoTimerStartTime: 10,
            verifyEmailInfoTimerStartTime: 10
        }
    };
});
define('config/auth',['exports'], function (exports) {
        'use strict';

        Object.defineProperty(exports, "__esModule", {
                value: true
        });
        exports.default = {
                'aurelia-authentication': {
                        endpoint: 'auth',

                        configureEndpoints: ['auth', 'user'],

                        baseUrl: 'auth',

                        loginUrl: '/login',

                        signupUrl: '/signup',

                        loginRedirect: '/#/self-service',

                        profileUrl: '/me',

                        accessTokenProp: 'access_token',
                        refreshTokenProp: 'refresh_token',
                        idTokenProp: 'id_token',
                        refreshTokenSubmitProp: 'refresh_token',
                        refreshTokenUrl: '/refresh-token',
                        useRefreshToken: true
                }
        };
});
define('config/deployed',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = {
        app: {
            environment: '{{environment}}' },
        'aurelia-api': {
            endpoints: [{
                name: 'user',
                endpoint: '{{apiUrl}}',
                default: true }, {
                name: 'auth',
                endpoint: '{{apiUrl}}' }]
        }
    };
});
define('config/local',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {};
});
define('config/router',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = {
        routes: [{
            route: ['', '/login'],
            name: 'login',
            moduleId: 'components/views/login/login',
            nav: false,
            auth: false,
            title: 'Login',
            settings: {
                t: 'login_route',
                roles: []
            }
        }, {
            route: '/logout',
            name: 'logout',
            moduleId: 'components/views/logout/logout',
            title: 'Logout',
            settings: {
                t: 'logout_route',
                roles: []
            }
        }, {
            route: '/enrollment',
            name: 'enrollment',
            moduleId: 'components/views/enrollment/enrollment',
            nav: false,
            auth: true,
            title: 'Enrollment',
            settings: {
                t: 'enrollment_route',
                roles: ['notenrolled']
            }
        }, {
            route: '/challenge',
            name: 'challenge',
            moduleId: 'components/views/challenge/challenge',
            nav: false,
            auth: true,
            title: 'Challenge',
            settings: {
                t: 'challenge_route',
                roles: []
            }
        }, {
            route: '/self-service',
            name: 'self-service',
            moduleId: 'components/views/self-service/self-service',
            nav: false,
            auth: true,
            title: 'Self Service',
            settings: {
                t: 'self-service_route',
                roles: []
            }
        }, {
            route: '/self-service/change-password',
            name: 'change-password',
            moduleId: 'components/views/change-password/change-password',
            nav: false,
            auth: true,
            title: 'Change Password',
            settings: {
                t: 'change-password_route',
                roles: []
            }
        }, {
            route: '/self-service/unlock-profile',
            name: 'unlock-profile',
            moduleId: 'components/views/unlock-profile/unlock-profile',
            nav: false,
            auth: true,
            title: 'Unlock Profile',
            settings: {
                t: 'unlock-profile_route',
                roles: []
            }
        }, {
            route: '/self-service/edit-credentials',
            name: 'edit-profile',
            moduleId: 'components/views/edit-credentials/edit-credentials',
            nav: false,
            auth: true,
            title: 'Edit Credentials',
            settings: {
                t: 'edit-credentials_route',
                roles: []
            }
        }],
        fallbackRoute: 'login'
    };
});
define('models/challengeQuestion',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var ChallengeQuestion = exports.ChallengeQuestion = function () {
        function ChallengeQuestion() {
            _classCallCheck(this, ChallengeQuestion);

            this.challengeQuestionId = '';
            this.challengeQuestionText = '';
            this.userAnswerText = '';
        }

        ChallengeQuestion.prototype.fromJson = function fromJson(response) {
            if (response) {
                if (response.challengeQuestionId) {
                    this.challengeQuestionId = response.challengeQuestionId;
                }
                if (response.challengeQuestionText) {
                    this.challengeQuestionText = response.challengeQuestionText;
                }
            }
        };

        return ChallengeQuestion;
    }();
});
define('models/challengeQuestionAnswer',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var ChallengeQuestionAnswer = exports.ChallengeQuestionAnswer = function () {
        function ChallengeQuestionAnswer() {
            _classCallCheck(this, ChallengeQuestionAnswer);

            this.challengeQuestionId = '';
            this.challengeQuestionText = '';
            this.userAnswerText = '';
        }

        ChallengeQuestionAnswer.prototype.fromJson = function fromJson(response) {
            if (response) {
                if (response.challengeQuestionId) {
                    this.challengeQuestionId = response.challengeQuestionId;
                }
                if (response.challengeQuestionText) {
                    this.challengeQuestionText = response.challengeQuestionText;
                }
                if (response.userAnswerText) {
                    this.userAnswerText = response.userAnswerText;
                }
            }
        };

        return ChallengeQuestionAnswer;
    }();
});
define('models/emailInfo',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var EmailInfo = exports.EmailInfo = function () {
        function EmailInfo() {
            _classCallCheck(this, EmailInfo);

            this.emailAddress = '';
            this.label = '';
            this.isDefault = false;
            this.verified = false;
            this.hasActiveToken = false;
        }

        EmailInfo.prototype.fromJson = function fromJson(response) {
            if (response) {
                if (response.emailAddress) {
                    this.emailAddress = response.emailAddress;
                }
                if (response.label) {
                    this.label = response.label;
                }
                this.isDefault = Boolean(response.isDefault);
                this.verified = Boolean(response.verified);
                this.hasActiveToken = Boolean(response.hasActiveToken);
            }
        };

        return EmailInfo;
    }();
});
define('models/smsInfo',['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var SmsInfo = exports.SmsInfo = function () {
        function SmsInfo() {
            _classCallCheck(this, SmsInfo);

            this.phoneNumber = '';
            this.label = '';
            this.isDefault = false;
            this.verified = false;
            this.hasActiveToken = false;
        }

        SmsInfo.prototype.fromJson = function fromJson(response) {
            if (response) {
                if (response.phoneNumber) {
                    this.phoneNumber = response.phoneNumber;
                }
                if (response.label) {
                    this.label = response.label;
                }
                this.isDefault = Boolean(response.isDefault);
                this.verified = Boolean(response.verified);
                this.hasActiveToken = Boolean(response.hasActiveToken);
            }
        };

        return SmsInfo;
    }();
});
define('models/user',['exports', 'models/challengeQuestion', 'models/challengeQuestionAnswer', 'models/smsInfo', 'models/emailInfo', 'util/common-models', 'config/app', 'lodash'], function (exports, _challengeQuestion, _challengeQuestionAnswer, _smsInfo, _emailInfo, _commonModels, _app, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.User = undefined;

    var _app2 = _interopRequireDefault(_app);

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var User = exports.User = function () {
        function User(attributes) {
            _classCallCheck(this, User);

            this.sessionId = '';
            this.transactionId = '';
            this.userId = '';
            this.credentials = '';
            this.fullName = '';
            this.access_token = '';
            this._availableChallengeQuestions = [];
            this._challengeQuestionAnswers = [];
            this.challengeQuestions = [];
            this.smsInfos = [];
            this.emailInfos = [];
            this.availableChallengeCredentialTypes = [];
            this.numberOfRequiredChallengeQuestionAnswers = _app2.default.enrollment.numberOfRequiredChallengeQuestionAnswers || 5;
            this.numberOfRequiredSmsInfos = _app2.default.enrollment.numberOfRequiredSmsInfos || 1;
            this.numberOfRequiredEmailInfos = _app2.default.enrollment.numberOfRequiredEmailInfos || 1;

            this.fromJson(attributes);
        }

        User.prototype.fromJson = function fromJson(response) {
            if (response) {
                if (response.authStatusCode) {
                    this.authStatusCode = _commonModels.AuthStatusCode[response.authStatusCode];
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
                if (response.access_token) {
                    this.access_token = response.access_token;
                }
                var buildChallengeQuestions = false;
                if (response.availableChallengeQuestionAnswers && response.availableChallengeQuestionAnswers.length && response.availableChallengeQuestionAnswers.length > 0) {
                    buildChallengeQuestions = true;
                    for (var i = 0; i < response.availableChallengeQuestionAnswers.length; i++) {
                        var newChallengeQuestion = new _challengeQuestion.ChallengeQuestion();
                        newChallengeQuestion.fromJson(response.availableChallengeQuestionAnswers[i]);
                        this._availableChallengeQuestions.push(newChallengeQuestion);
                    }
                }
                var mapChallengeQuestionAnswers = false;
                if (response.challengeQuestionAnswers && response.challengeQuestionAnswers.length && response.challengeQuestionAnswers.length > 0) {
                    mapChallengeQuestionAnswers = true;
                    for (var j = 0; j < response.challengeQuestionAnswers.length; j++) {
                        var newChallengeQuestionAnswer = new _challengeQuestionAnswer.ChallengeQuestionAnswer();
                        newChallengeQuestionAnswer.fromJson(response.challengeQuestionAnswers[j]);
                        this._challengeQuestionAnswers.push(newChallengeQuestionAnswer);
                    }
                }
                if (response.smsInfos && response.smsInfos.length && response.smsInfos.length > 0) {
                    for (var k = 0; k < response.smsInfos.length; k++) {
                        var newSmsInfo = new _smsInfo.SmsInfo();
                        newSmsInfo.fromJson(response.smsInfos[k]);
                        this.smsInfos.push(newSmsInfo);
                    }
                }
                if (response.emailInfos && response.emailInfos.length && response.emailInfos.length > 0) {
                    for (var l = 0; l < response.emailInfos.length; l++) {
                        var newEmailInfo = new _emailInfo.EmailInfo();
                        newEmailInfo.fromJson(response.emailInfos[l]);
                        this.emailInfos.push(newEmailInfo);
                    }
                }
                if (response.credentialTypes && response.credentialTypes.length && response.credentialTypes.length > 0) {
                    for (var m = 0; m < response.credentialTypes.length; m++) {
                        this.availableChallengeCredentialTypes.push(response.credentialTypes[m]);
                    }
                }

                if (buildChallengeQuestions) {
                    this.buildChallengeQuestions(this.numberOfRequiredChallengeQuestionAnswers);
                }
                if (mapChallengeQuestionAnswers) {
                    if (!buildChallengeQuestions) {
                        if (response.challengeQuestionAnswers && response.challengeQuestionAnswers.length && response.challengeQuestionAnswers.length > 0) {
                            for (var n = 0; n < response.challengeQuestionAnswers.length; n++) {
                                var _newChallengeQuestion = new _challengeQuestion.ChallengeQuestion();
                                _newChallengeQuestion.fromJson(response.challengeQuestionAnswers[n]);
                                this._availableChallengeQuestions.push(_newChallengeQuestion);
                            }
                            this.buildChallengeQuestions(response.challengeQuestionAnswers.length);
                        }
                    }
                    this.mapChallengeQuestionAnswers();
                }
            }
        };

        User.prototype.buildChallengeQuestions = function buildChallengeQuestions(numberOfChallengeQuestions) {
            this.challengeQuestions = [];
            for (var i = 0; i < numberOfChallengeQuestions; i++) {
                this.challengeQuestions.push({
                    availableChallengeQuestions: _lodash2.default.orderBy(_lodash2.default.cloneDeep(this._availableChallengeQuestions, ['challengeQuestionId'], ['asc'])),
                    selectedAvailableChallengeQuestion: null,
                    previouslySelectedAvailableChallengeQuestion: null,
                    userAnswerText: '',
                    showActualAnswer: false
                });
            }
        };

        User.prototype.updateAvailableChallengeQuestions = function updateAvailableChallengeQuestions(selectedChallengeQuestion, selectedAvailableChallengeQuestion) {
            for (var i = 0; i < this.challengeQuestions.length; i++) {
                var currentChallengeQuestion = this.challengeQuestions[i];
                if (currentChallengeQuestion !== selectedChallengeQuestion) {
                    var removedAvailableChallengeQuestion = void 0;
                    if (selectedAvailableChallengeQuestion !== null) {
                        var index = _lodash2.default.findIndex(currentChallengeQuestion.availableChallengeQuestions, selectedAvailableChallengeQuestion);
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
        };

        User.prototype.getChallengeQuestionAnswers = function getChallengeQuestionAnswers() {
            var challengeQuestionAnswers = [];
            for (var i = 0; i < this.challengeQuestions.length; i++) {
                var challengeQuestion = this.challengeQuestions[i];
                if (challengeQuestion && challengeQuestion.selectedAvailableChallengeQuestion && challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId && challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionText && challengeQuestion.userAnswerText) {
                    challengeQuestionAnswers.push({
                        challengeQuestionId: challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId,
                        challengeQuestionText: challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionText,
                        userAnswerText: challengeQuestion.userAnswerText
                    });
                }
            }
            return challengeQuestionAnswers;
        };

        User.prototype.mapChallengeQuestionAnswers = function mapChallengeQuestionAnswers() {
            var _this = this;

            var _loop = function _loop(i) {
                var challengeQuestion = _this.challengeQuestions[i];
                var challengeQuestionAnswer = _this._challengeQuestionAnswers[i];
                if (challengeQuestion && challengeQuestionAnswer) {
                    challengeQuestion.selectedAvailableChallengeQuestion = _lodash2.default.find(challengeQuestion.availableChallengeQuestions, function (a) {
                        return a.challengeQuestionId === challengeQuestionAnswer.challengeQuestionId;
                    });
                    _this.updateAvailableChallengeQuestions(challengeQuestion, challengeQuestion.selectedAvailableChallengeQuestion);
                }
            };

            for (var i = 0; i < this.challengeQuestions.length; i++) {
                _loop(i);
            }
        };

        _createClass(User, [{
            key: 'challengeQuestionAnswersComplete',
            get: function get() {
                return this._challengeQuestionAnswers && this._challengeQuestionAnswers.length && this._challengeQuestionAnswers.length >= this.numberOfRequiredChallengeQuestionAnswers;
            }
        }, {
            key: 'smsInfosComplete',
            get: function get() {
                return this.smsInfos && this.smsInfos.length && this.smsInfos.length >= this.numberOfRequiredSmsInfos;
            }
        }, {
            key: 'emailInfosComplete',
            get: function get() {
                var isValid = false;
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
        }]);

        return User;
    }();
});
define('resources/index',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.configure = configure;
    function configure(config) {
        config.globalResources(["./value-converters/date-formatter", "./value-converters/phone-formatter", "./value-converters/timer-formatter"]);
    }
});
define('services/user-service',['exports', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-notification', 'aurelia-router', 'aurelia-api', 'aurelia-authentication', 'util/logger-helper', 'util/device-helper'], function (exports, _aureliaFramework, _aureliaFetchClient, _aureliaNotification, _aureliaRouter, _aureliaApi, _aureliaAuthentication, _loggerHelper, _deviceHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UserService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var UserService = exports.UserService = (_dec = (0, _aureliaFramework.inject)(_aureliaApi.Config, _deviceHelper.DeviceHelper, _aureliaRouter.Router, _aureliaNotification.Notification, _aureliaAuthentication.AuthService), _dec(_class = function () {
        function UserService(config, deviceHelper) {
            _classCallCheck(this, UserService);

            this.isRequesting = false;

            this.userEndpoint = config.getEndpoint("user");
            this.deviceHelper = deviceHelper;
        }

        UserService.prototype.signin = function signin(request) {
            var _this = this;

            this._pre(request);
            return this.userEndpoint.post('signin', request).then(function (response) {
                _this._post(response);
                return response;
            });
        };

        UserService.prototype.analyzePreAuthUser = function analyzePreAuthUser(request) {
            var _this2 = this;

            this._pre(request);
            return this.userEndpoint.post('analyzepreauthuser', request).then(function (response) {
                _this2._post(response);
                return response;
            });
        };

        UserService.prototype.challengePreAuthUser = function challengePreAuthUser(request) {
            var _this3 = this;

            this._pre(request);
            return this.userEndpoint.post('challengepreauthuser', request).then(function (response) {
                _this3._post(response);
                return response;
            });
        };

        UserService.prototype.challengeUser = function challengeUser(request) {
            var _this4 = this;

            this._pre(request);
            return this.userEndpoint.post('challengeuser', request).then(function (response) {
                _this4._post(response);
            });
        };

        UserService.prototype.authenticatePreAuthUser = function authenticatePreAuthUser(request) {
            var _this5 = this;

            this._pre(request);
            return this.userEndpoint.post('authenticatepreauthuser', request).then(function (response) {
                _this5._post(response);
                return response;
            });
        };

        UserService.prototype.authenticateUser = function authenticateUser(request) {
            var _this6 = this;

            this._pre(request);
            return this.userEndpoint.post('authenticateuser', request).then(function (response) {
                _this6._post(response);
                return response;
            });
        };

        UserService.prototype.getPreAuthUser = function getPreAuthUser(request) {
            var _this7 = this;

            this._pre(request);
            return this.userEndpoint.post('getpreauthuser', request).then(function (response) {
                _this7._post(response);
                return response;
            });
        };

        UserService.prototype.getUser = function getUser(request) {
            var _this8 = this;

            this._pre(request);
            return this.userEndpoint.post('getuser', request).then(function (response) {
                _this8._post(response);
                return response;
            });
        };

        UserService.prototype.addChallengeQuestionAnswers = function addChallengeQuestionAnswers(request) {
            var _this9 = this;

            this._pre(request);
            return this.userEndpoint.post('addchallengequestionanswers', request).then(function (response) {
                _this9._post(response);
                return response;
            });
        };

        UserService.prototype.verifyContactInfo = function verifyContactInfo(request) {
            var _this10 = this;

            this._pre(request);
            return this.userEndpoint.post('verifycontactinfo', request).then(function (response) {
                _this10._post(response);
                return response;
            });
        };

        UserService.prototype.removeContactInfo = function removeContactInfo(request) {
            var _this11 = this;

            this._pre(request);
            return this.userEndpoint.post('removecontactinfo', request).then(function (response) {
                _this11._post(response);
                return response;
            });
        };

        UserService.prototype.resetPassword = function resetPassword(request) {
            var _this12 = this;

            this._pre(request);
            return this.userEndpoint.post('resetcredentials', request).then(function (response) {
                _this12._post(response);
                return response;
            });
        };

        UserService.prototype._pre = function _pre(request) {
            this.isRequesting = true;
            if (request) {
                request.deviceRequest = this.deviceHelper.deviceRequest;
            }
        };

        UserService.prototype._post = function _post(response) {
            if (response && response.deviceRequest && response.deviceRequest.deviceTokenCookie) {
                this.deviceHelper.setDeviceTokenCookie(response.deviceRequest.deviceTokenCookie);
            }
            this.isRequesting = false;
        };

        return UserService;
    }()) || _class);
});
define('util/event-timer',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var EventTimer = function () {
        function EventTimer(eventAggregator) {
            _classCallCheck(this, EventTimer);

            this.eventAggregator = eventAggregator;
        }

        EventTimer.prototype.start = function start(interval, tickKey, timeoutKey) {
            var _this = this;

            var currentTime = interval;

            this.intervalId = window.setInterval(function () {
                if (--currentTime < 0) {
                    _this.stop();
                    if (_this.eventAggregator && _this.eventAggregator.publish && timeoutKey) {
                        _this.eventAggregator.publish(timeoutKey, 0);
                    }
                }
                if (_this.eventAggregator && _this.eventAggregator.publish && tickKey) {
                    _this.eventAggregator.publish(tickKey, currentTime);
                }
            }, 1000);
        };

        EventTimer.prototype.stop = function stop() {
            window.clearInterval(this.intervalId);
        };

        return EventTimer;
    }();

    exports.default = EventTimer;
});
define('util/location-helper',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    function LocationHelperFunction() {
        return {
            getQueryParameter: function getQueryParameter(key, default_) {
                if (default_ == null) {
                    default_ = null;
                }
                key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                key = key.replace("$", "\\$");
                var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
                var qs = regex.exec(window.location.href);
                if (qs == null) {
                    return default_;
                } else {
                    return decodeURIComponent(qs[1]);
                }
            }
        };
    }

    var LocationHelper = exports.LocationHelper = new LocationHelperFunction();
});
define('util/logger-helper',['exports', 'aurelia-framework', 'config/app'], function (exports, _aureliaFramework, _app) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.logger = undefined;

  var _app2 = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var logger = exports.logger = _aureliaFramework.LogManager.getLogger(_app2.default.logger.name);
});
define('util/string-helper',['exports', 'moment', 'util/logger-helper'], function (exports, _moment, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.StringHelper = undefined;

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function StringHelperFunction() {
        return {
            formatDate: function formatDate(date) {
                var formattedDate = '';
                if (date) {
                    try {
                        var d = new Date(date);
                        formattedDate = (0, _moment2.default)(d).format('MM/DD/YYYY');
                    } catch (dateErr) {
                        _loggerHelper.logger.warn("Invalid value for view:" + value, dateErr);
                    }
                }
                if (formattedDate === 'Invalid date') {
                    formattedDate = null;
                }
                return formattedDate;
            },

            parseDate: function parseDate(date) {
                var parsedDate = '';
                if (date) {
                    if (date === 'Invalid date') {
                        return null;
                    }
                    try {
                        parsedDate = (0, _moment2.default)(new Date(date)).format('YYYY-MM-DDTHH:mm:ssZ');
                    } catch (dateErr) {
                        parsedDate = null;
                        _loggerHelper.logger.warn("invalid value from view: " + value, dateErr);
                    }
                }
                return parsedDate;
            },

            formatPhoneNumber: function formatPhoneNumber(phoneNumber) {
                var formattedPhoneNumber = '';
                if (phoneNumber) {
                    var rawPhoneNumber = phoneNumber.replace(/\D/g, '');
                    var size = rawPhoneNumber.length;

                    if (size > 10) {
                        rawPhoneNumber = rawPhoneNumber.substring(1, 11);
                    }

                    formattedPhoneNumber = rawPhoneNumber.toString();
                    if (size > 0 && size < 4) {
                        formattedPhoneNumber = '(' + formattedPhoneNumber;
                    } else if (size < 7) {
                        formattedPhoneNumber = '(' + formattedPhoneNumber.substring(0, 3) + ') ' + formattedPhoneNumber.substring(3, 6);
                    } else {
                        formattedPhoneNumber = '(' + formattedPhoneNumber.substring(0, 3) + ') ' + formattedPhoneNumber.substring(3, 6) + ' - ' + formattedPhoneNumber.substring(6, 10);
                    }
                }
                return formattedPhoneNumber;
            },

            parsePhoneNumber: function parsePhoneNumber(phoneNumber) {
                var parsedPhoneNumber = '';
                if (phoneNumber) {
                    parsedPhoneNumber = phoneNumber.replace(/\D/g, '').substring(0, 10);
                }
                return parsedPhoneNumber;
            }
        };
    }

    var StringHelper = exports.StringHelper = new StringHelperFunction();
});
define('util/window-helper',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var WindowHelper = exports.WindowHelper = function () {
        function WindowHelper() {
            _classCallCheck(this, WindowHelper);
        }

        WindowHelper.prototype.addEventListener = function addEventListener(type, listener, options) {
            if (window && window.addEventListener) {
                window.addEventListener(type, listener, options);
            }
        };

        WindowHelper.prototype.removeEventListener = function removeEventListener(type, listener, options, useCapture) {
            if (window && window.removeEventListener) {
                window.removeEventListener(type, listener, options);
            }
        };

        return WindowHelper;
    }();
});
define('components/site-footer/site-footer',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SiteFooter = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2;

    var SiteFooter = exports.SiteFooter = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = (_class2 = function () {
        function SiteFooter(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, SiteFooter);

            _initDefineProp(this, 'router', _descriptor, this);

            _initDefineProp(this, 'languages', _descriptor2, this);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        SiteFooter.prototype.setLanguage = function setLanguage(event, language) {
            localStorage.setItem('language', language.code);
            _loggerHelper.logger.info('language_changed');
            window.top.location.reload();
        };

        return SiteFooter;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'router', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'languages', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    })), _class2)) || _class);
});
define('components/nav-bar/nav-bar',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'components/views/confirm-dialog/confirm-dialog', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _confirmDialog, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.NavBar = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2;

    var NavBar = exports.NavBar = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = (_class2 = function () {
        function NavBar(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, NavBar);

            _initDefineProp(this, 'router', _descriptor, this);

            _initDefineProp(this, 'username', _descriptor2, this);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        NavBar.prototype.goToLogout = function goToLogout() {
            var _this = this;

            var confirmDialogModel = this.i18n.tr('logout-dialog', { returnObjects: true });

            this.dialogService.open({ viewModel: _confirmDialog.ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (!openDialogResult.wasCancelled) {
                    _this.router.navigateToRoute('logout');
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this.notification.error('logout_error');
            });
        };

        _createClass(NavBar, [{
            key: 'isAuthenticated',
            get: function get() {
                return this.authService.isAuthenticated();
            }
        }]);

        return NavBar;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'router', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'username', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    })), _class2)) || _class);
});
define('components/validation-summary/validation-summary',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ValidationSummary = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _desc, _value, _class, _descriptor, _descriptor2;

    var ValidationSummary = exports.ValidationSummary = (_class = function ValidationSummary() {
        _classCallCheck(this, ValidationSummary);

        _initDefineProp(this, 'errors', _descriptor, this);

        _initDefineProp(this, 'autofocus', _descriptor2, this);
    }, (_descriptor = _applyDecoratedDescriptor(_class.prototype, 'errors', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, 'autofocus', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    })), _class);
});
define('resources/messages/challenge-messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var ChallengeStart = exports.ChallengeStart = function ChallengeStart(attributes) {
        _classCallCheck(this, ChallengeStart);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeCancel = exports.ChallengeCancel = function ChallengeCancel(attributes) {
        _classCallCheck(this, ChallengeCancel);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeReceived = exports.ChallengeReceived = function ChallengeReceived(attributes) {
        _classCallCheck(this, ChallengeReceived);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeVerify = exports.ChallengeVerify = function ChallengeVerify(attributes) {
        _classCallCheck(this, ChallengeVerify);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeSuccess = exports.ChallengeSuccess = function ChallengeSuccess(attributes) {
        _classCallCheck(this, ChallengeSuccess);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeFail = exports.ChallengeFail = function ChallengeFail(attributes) {
        _classCallCheck(this, ChallengeFail);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeComplete = exports.ChallengeComplete = function ChallengeComplete(attributes) {
        _classCallCheck(this, ChallengeComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };
});
define('resources/messages/enrollment-messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var EnrollmentDisclaimerConfirmed = exports.EnrollmentDisclaimerConfirmed = function EnrollmentDisclaimerConfirmed(attributes) {
        _classCallCheck(this, EnrollmentDisclaimerConfirmed);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollmentStart = exports.EnrollmentStart = function EnrollmentStart(attributes) {
        _classCallCheck(this, EnrollmentStart);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollChallengeQuestionAnswersComplete = exports.EnrollChallengeQuestionAnswersComplete = function EnrollChallengeQuestionAnswersComplete(attributes) {
        _classCallCheck(this, EnrollChallengeQuestionAnswersComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollPhoneInfosComplete = exports.EnrollPhoneInfosComplete = function EnrollPhoneInfosComplete(attributes) {
        _classCallCheck(this, EnrollPhoneInfosComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollEmailInfosComplete = exports.EnrollEmailInfosComplete = function EnrollEmailInfosComplete(attributes) {
        _classCallCheck(this, EnrollEmailInfosComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollCredentialsComplete = exports.EnrollCredentialsComplete = function EnrollCredentialsComplete(attributes) {
        _classCallCheck(this, EnrollCredentialsComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var EnrollmentComplete = exports.EnrollmentComplete = function EnrollmentComplete(attributes) {
        _classCallCheck(this, EnrollmentComplete);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };
});
define('resources/messages/event-messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var RequiredCredentialTypeChanged = exports.RequiredCredentialTypeChanged = function RequiredCredentialTypeChanged(attributes) {
        _classCallCheck(this, RequiredCredentialTypeChanged);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };
});
define('resources/messages/login-messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var GoToLogin = exports.GoToLogin = function GoToLogin(attributes) {
        _classCallCheck(this, GoToLogin);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToLogout = exports.GoToLogout = function GoToLogout(attributes) {
        _classCallCheck(this, GoToLogout);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var SigninSuccess = exports.SigninSuccess = function SigninSuccess(attributes) {
        _classCallCheck(this, SigninSuccess);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var ChallengeWithCredentials = exports.ChallengeWithCredentials = function ChallengeWithCredentials(attributes) {
        _classCallCheck(this, ChallengeWithCredentials);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var AuthenticateUserFail = exports.AuthenticateUserFail = function AuthenticateUserFail(attributes) {
        _classCallCheck(this, AuthenticateUserFail);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var AuthenticateUserSuccess = exports.AuthenticateUserSuccess = function AuthenticateUserSuccess(attributes) {
        _classCallCheck(this, AuthenticateUserSuccess);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToForgotPassword = exports.GoToForgotPassword = function GoToForgotPassword(attributes) {
        _classCallCheck(this, GoToForgotPassword);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };
});
define('resources/messages/self-service-messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var GoToChangePassword = exports.GoToChangePassword = function GoToChangePassword(attributes) {
        _classCallCheck(this, GoToChangePassword);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToEditProfile = exports.GoToEditProfile = function GoToEditProfile(attributes) {
        _classCallCheck(this, GoToEditProfile);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToUnlockProfile = exports.GoToUnlockProfile = function GoToUnlockProfile(attributes) {
        _classCallCheck(this, GoToUnlockProfile);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToEditChallengeQuestionAnswers = exports.GoToEditChallengeQuestionAnswers = function GoToEditChallengeQuestionAnswers(attributes) {
        _classCallCheck(this, GoToEditChallengeQuestionAnswers);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToEditPhoneInfos = exports.GoToEditPhoneInfos = function GoToEditPhoneInfos(attributes) {
        _classCallCheck(this, GoToEditPhoneInfos);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };

    var GoToEditEmailInfos = exports.GoToEditEmailInfos = function GoToEditEmailInfos(attributes) {
        _classCallCheck(this, GoToEditEmailInfos);

        if (attributes) {
            Object.assign(this, attributes);
        }
    };
});
define('resources/value-converters/date-formatter',['exports', 'aurelia-framework', 'util/logger-helper', 'util/string-helper'], function (exports, _aureliaFramework, _loggerHelper, _stringHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.dateFormatterValueConverter = undefined;

    var _stringHelper2 = _interopRequireDefault(_stringHelper);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var dateFormatterValueConverter = exports.dateFormatterValueConverter = (_dec = (0, _aureliaFramework.valueConverter)("dateFormatter"), _dec(_class = function () {
        function dateFormatterValueConverter() {
            _classCallCheck(this, dateFormatterValueConverter);
        }

        dateFormatterValueConverter.prototype.toView = function toView(value) {
            return _stringHelper2.default.formatDate(value);
        };

        dateFormatterValueConverter.prototype.fromView = function fromView(value) {
            return _stringHelper2.default.parseDate(value);
        };

        return dateFormatterValueConverter;
    }()) || _class);
});
define('resources/value-converters/interval-formatter',['exports', 'aurelia-framework', 'util/logger-helper', 'util/string-helper'], function (exports, _aureliaFramework, _loggerHelper, _stringHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.intervalFormatterValueConverter = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var intervalFormatterValueConverter = exports.intervalFormatterValueConverter = (_dec = (0, _aureliaFramework.valueConverter)("intervalFormatter"), _dec(_class = function () {
        function intervalFormatterValueConverter() {
            _classCallCheck(this, intervalFormatterValueConverter);
        }

        intervalFormatterValueConverter.prototype.toView = function toView(value) {
            return _stringHelper.StringHelper.formatInterval(value);
        };

        return intervalFormatterValueConverter;
    }()) || _class);
});
define('resources/value-converters/phone-formatter',['exports', 'aurelia-framework', 'util/logger-helper', 'util/string-helper'], function (exports, _aureliaFramework, _loggerHelper, _stringHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.phoneFormatterValueConverter = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var phoneFormatterValueConverter = exports.phoneFormatterValueConverter = (_dec = (0, _aureliaFramework.valueConverter)("phoneFormatter"), _dec(_class = function () {
        function phoneFormatterValueConverter() {
            _classCallCheck(this, phoneFormatterValueConverter);
        }

        phoneFormatterValueConverter.prototype.toView = function toView(value) {
            return _stringHelper.StringHelper.formatPhoneNumber(value);
        };

        phoneFormatterValueConverter.prototype.fromView = function fromView(value) {
            return _stringHelper.StringHelper.parsePhoneNumber(value);
        };

        return phoneFormatterValueConverter;
    }()) || _class);
});
define('resources/value-converters/timer-formatter',['exports', 'numbro'], function (exports, _numbro) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TimerFormatterValueConverter = undefined;

    var _numbro2 = _interopRequireDefault(_numbro);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var TimerFormatterValueConverter = exports.TimerFormatterValueConverter = function () {
        function TimerFormatterValueConverter() {
            _classCallCheck(this, TimerFormatterValueConverter);
        }

        TimerFormatterValueConverter.prototype.toView = function toView(value) {
            if (value === '0') {
                return 'Invalid time';
            } else {
                var formattedValue = (0, _numbro2.default)(value).format('0:0');
                return formattedValue.substring(formattedValue.length - 5, formattedValue.length);
            }
        };

        return TimerFormatterValueConverter;
    }();
});
define('components/views/challenge-with-challenge-questions/challenge-with-challenge-questions',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'resources/messages/challenge-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _challengeMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChallengeWithChallengeQuestions = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChallengeWithChallengeQuestions = exports.ChallengeWithChallengeQuestions = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChallengeWithChallengeQuestions(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChallengeWithChallengeQuestions);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ChallengeWithChallengeQuestions.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                resolve();
            });
        };

        ChallengeWithChallengeQuestions.prototype.applyValidationRules = function applyValidationRules() {
            for (var i = 0; i < this.vm.user.challengeQuestions.length; i++) {
                var challengeQuestion = this.vm.user.challengeQuestions[i];
                _aureliaValidation.ValidationRules.ensure('userAnswerText').required().on(challengeQuestion);
            }
        };

        ChallengeWithChallengeQuestions.prototype.onSelectedAvailableChallengeQuestionAnswerChanged = function onSelectedAvailableChallengeQuestionAnswerChanged(event, bindingContext, selectedAvailableChallengeQuestion) {
            this.vm.user.updateAvailableChallengeQuestions(bindingContext.challengeQuestion, selectedAvailableChallengeQuestion);
        };

        ChallengeWithChallengeQuestions.prototype.cancel = function cancel(event) {
            var _this2 = this;

            return new Promise(function (resolve) {
                _this2.eventAggregator.publish(new _challengeMessages.ChallengeCancel());
                resolve();
            });
        };

        ChallengeWithChallengeQuestions.prototype._getCredentials = function _getCredentials() {
            var credentials = '';
            for (var _iterator = this.vm.user.challengeQuestions, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var challengeQuestion = _ref;

                if (challengeQuestion.userAnswerText !== null || challengeQuestion.userAnswerText.length >= 0) {
                    credentials = credentials + challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId + '|' + challengeQuestion.userAnswerText + ',';
                }
            }
            credentials = _lodash2.default.trimEnd(credentials, ',');
            return credentials;
        };

        ChallengeWithChallengeQuestions.prototype.next = function next() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (result) {
                    if (result.valid) {
                        var credentials = _this3._getCredentials();
                        var message = {
                            credentialType: 'Questions',
                            credentials: credentials
                        };
                        _this3.eventAggregator.publish(new _challengeMessages.ChallengeVerify(message));
                    }
                    resolve();
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    _this3.notification.error('challenge_error');
                    reject(validateReason);
                });
            });
        };

        return ChallengeWithChallengeQuestions;
    }()) || _class);
});
define('components/views/challenge-with-email-info/challenge-with-email-info',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'components/views/verify-email-info-dialog/verify-email-info-dialog', 'resources/messages/challenge-messages', 'util/logger-helper', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _verifyEmailInfoDialog, _challengeMessages, _loggerHelper, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChallengeWithEmailInfo = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChallengeWithEmailInfo = exports.ChallengeWithEmailInfo = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChallengeWithEmailInfo(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChallengeWithEmailInfo);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ChallengeWithEmailInfo.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.vm = viewModel;
                var request = {
                    userId: _this.vm.user.userId,
                    token: _this.vm.user.token
                };
                _this.userService.getPreAuthUser(request).then(function (response) {
                    _this.vm.user.fromJson(response);
                    resolve();
                }).catch(function (reason) {
                    _loggerHelper.logger.error(reason);
                    _this.notification.error('get-user_error');
                    reject(reason);
                });
            });
        };

        ChallengeWithEmailInfo.prototype.cancel = function cancel(message) {
            this.eventAggregator.publish(new _challengeMessages.ChallengeCancel());
        };

        ChallengeWithEmailInfo.prototype.challengeUser = function challengeUser(event) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.controller.validate().then(function (result) {
                    if (result.valid) {
                        var request = {
                            userId: _this2.vm.user.userId,
                            credentialType: 'Email',
                            contactInfo: _this2.vm.emailAddress,
                            label: _this2.vm.emailAddress,
                            isDefault: true
                        };
                        _this2.userService.challengeUser(request).then(function (response) {
                            _this2.vm.user.sessionId = response.sessionId;
                            _this2.vm.user.transactionId = response.transactionId;
                            if (response.challengeStatus !== 'Deny') {
                                _this2.goToVerifyEmailInfo(response);
                            } else {
                                _this2.notification.error('challenge-user-deny_error');
                            }
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            _this2.notification.error('challenge-user_error');
                            reject(reason);
                        });
                    } else {
                        resolve();
                    }
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    reject(validateReason);
                });
            });
        };

        ChallengeWithEmailInfo.prototype.goToVerifyEmailInfo = function goToVerifyEmailInfo(message) {
            var _this3 = this;

            var verifyEmailInfoModel = {
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
            return this.dialogService.open({ viewModel: _verifyEmailInfoDialog.VerifyEmailInfoDialog, model: verifyEmailInfoModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        _this3.notification.info('verify-email-info_resend');
                        _this3.challengeUser();
                    } else {
                        _this3.notification.info('verify-email-info_canceled');
                    }
                } else {
                    _this3.onChallengeSuccess(openDialogResult.output);
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this3.notification.info('verify-email-info_error');
            });
        };

        ChallengeWithEmailInfo.prototype.onChallengeSuccess = function onChallengeSuccess(message) {
            this.eventAggregator.publish(new _challengeMessages.ChallengeSuccess(message));
        };

        ChallengeWithEmailInfo.prototype.onChallengeFail = function onChallengeFail(message) {
            this.eventAggregator.publish(new _challengeMessages.ChallengeFail(message));
        };

        return ChallengeWithEmailInfo;
    }()) || _class);
});
define('components/views/challenge-with-phone-info/challenge-with-phone-info',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'components/views/verify-phone-info-dialog/verify-phone-info-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'resources/messages/challenge-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _verifyPhoneInfoDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _challengeMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChallengeWithPhoneInfo = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChallengeWithPhoneInfo = exports.ChallengeWithPhoneInfo = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChallengeWithPhoneInfo(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChallengeWithPhoneInfo);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ChallengeWithPhoneInfo.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.selectedSmsInfo = null;
                _this.applyValidationRules();
                resolve();
            });
        };

        ChallengeWithPhoneInfo.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(_challengeMessages.ChallengeReceived, function (message) {
                return _this2.onChallengeReceived(message);
            }));
        };

        ChallengeWithPhoneInfo.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        ChallengeWithPhoneInfo.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('selectedSmsInfo').required().on(this.vm);
        };

        ChallengeWithPhoneInfo.prototype.cancel = function cancel(event) {
            var _this3 = this;

            return new Promise(function (resolve) {
                _this3.eventAggregator.publish(new _challengeMessages.ChallengeCancel());
                resolve();
            });
        };

        ChallengeWithPhoneInfo.prototype.next = function next(event) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.controller.validate().then(function (result) {
                    if (result.valid) {
                        var message = {
                            credentialType: 'Phone',
                            label: _this4.vm.selectedSmsInfo.label
                        };
                        _this4.eventAggregator.publish(new _challengeMessages.ChallengeStart(message));
                    }
                    resolve();
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    _this4.notification.error('challenge_error');
                    reject(validateReason);
                });
            });
        };

        ChallengeWithPhoneInfo.prototype.onChallengeReceived = function onChallengeReceived(message) {
            var _this5 = this;

            var verifyPhoneInfoModel = {
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
                viewModel: _verifyPhoneInfoDialog.VerifyPhoneInfoDialog,
                model: verifyPhoneInfoModel,
                rejectOnCancel: false
            }).whenClosed(function (openDialogResult) {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        _this5.notification.info('verify-phone-info_resend');
                        _this5.next();
                    } else {
                        _this5.notification.info('verify-phone-info_canceled');
                    }
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this5.notification.info('verify-phone-info_error');
            });
        };

        return ChallengeWithPhoneInfo;
    }()) || _class);
});
define('components/views/challenge-with-rsa-token/challenge-with-rsa-token',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'resources/messages/challenge-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _challengeMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChallengeWithRSAToken = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChallengeWithRSAToken = exports.ChallengeWithRSAToken = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChallengeWithRSAToken(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChallengeWithRSAToken);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ChallengeWithRSAToken.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.vm = viewModel;
                var request = {
                    userId: _this.vm.user.userId,
                    credentialType: 'Questions',
                    authToken: _this.vm.authToken
                };
                _this.userService.challengeUser(request).then(function (response) {
                    if (response.challengeStatus !== 'Deny') {
                        _this.vm.user.fromJson(response);
                        _this.applyValidationRules();
                    } else {
                        _this.notification.error('challenge-user_error');
                    }
                    resolve();
                }).catch(function (reason) {
                    _loggerHelper.logger.error(reason);
                    _this.notification.error('challenge-user_error');
                    reject(reason);
                });
            });
        };

        ChallengeWithRSAToken.prototype.applyValidationRules = function applyValidationRules() {
            for (var i = 0; i < this.vm.user.challengeQuestions.length; i++) {
                var challengeQuestion = this.vm.user.challengeQuestions[i];
                _aureliaValidation.ValidationRules.ensure('userAnswerText').required().on(challengeQuestion);
            }
        };

        ChallengeWithRSAToken.prototype.onSelectedAvailableChallengeQuestionAnswerChanged = function onSelectedAvailableChallengeQuestionAnswerChanged(event, bindingContext, selectedAvailableChallengeQuestion) {
            this.vm.user.updateAvailableChallengeQuestions(bindingContext.challengeQuestion, selectedAvailableChallengeQuestion);
        };

        ChallengeWithRSAToken.prototype.cancel = function cancel(event) {
            var _this2 = this;

            return new Promise(function (resolve) {
                _this2.eventAggregator.publish(new _challengeMessages.ChallengeCancel());
                resolve();
            });
        };

        ChallengeWithRSAToken.prototype._getCredentials = function _getCredentials() {
            var credentials = '';
            for (var _iterator = this.vm.user.challengeQuestions, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var challengeQuestion = _ref;

                if (challengeQuestion.userAnswerText !== null || challengeQuestion.userAnswerText.length >= 0) {
                    credentials = credentials + challengeQuestion.selectedAvailableChallengeQuestion.challengeQuestionId + '|' + challengeQuestion.userAnswerText + ',';
                }
            }
            credentials = _lodash2.default.trimEnd(credentials, ',');
            return credentials;
        };

        ChallengeWithRSAToken.prototype.next = function next() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (controllerValidateResult) {
                    if (controllerValidateResult.valid) {
                        var credentials = _this3._getCredentials();
                        var request = {
                            sessionId: _this3.vm.user.sessionId,
                            transactionId: _this3.vm.user.transactionId,
                            userId: _this3.vm.user.userId,
                            authToken: _this3.vm.user.authToken,
                            credentialType: 'Questions',
                            credentials: credentials,
                            bindDevice: _this3.vm.bindDevice
                        };
                        _this3.userService.authenticateUser(request).then(function (response) {
                            if (response.authStatusCode !== 'Deny') {
                                _this3.onChallengeSuccess(response);
                            } else {
                                _this3.notification.error('challenge_error');
                                _this3.onChallengeFail(response);
                            }
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            _this3.notification.error('challenge_error');
                            reject(reason);
                        });
                    } else {
                        resolve();
                    }
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    _this3.notification.error('challenge_error');
                    reject(validateReason);
                });
            });
        };

        ChallengeWithRSAToken.prototype.onChallengeSuccess = function onChallengeSuccess(message) {
            this.eventAggregator.publish(new _challengeMessages.ChallengeSuccess(message));
        };

        ChallengeWithRSAToken.prototype.onChallengeFail = function onChallengeFail(message) {
            this.eventAggregator.publish(new _challengeMessages.ChallengeFail(message));
        };

        return ChallengeWithRSAToken;
    }()) || _class);
});
define('components/views/change-password/change-password',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'models/user', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _user, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChangePassword = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChangePassword = exports.ChangePassword = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChangePassword(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChangePassword);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            var payload = authService.getTokenPayload();
            this.vm.user.userId = payload ? payload.username : null;
        }

        ChangePassword.prototype.activate = function activate(params, routeConfig, navigationInstruction) {
            var _this = this;

            var request = {
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId,
                userId: this.vm.user.userId
            };
            return this.userService.getUser(request).then(function (response) {
                _this.vm.user = new _user.User();
                _this.vm.user.fromJson(response);
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this.notification.error('get-user_error');
            });
        };

        return ChangePassword;
    }()) || _class);
});
define('components/views/confirm-dialog/confirm-dialog',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ConfirmDialog = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ConfirmDialog = exports.ConfirmDialog = (_dec = (0, _aureliaFramework.inject)(_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ConfirmDialog(dialogController, eventAggregator, notification, i18n, authService, userService) {
            _classCallCheck(this, ConfirmDialog);

            this.vm = {
                headerIcon: '',
                headerText: '',
                message: '',
                messageParams: {},
                cancelButtonText: '',
                confirmButtonText: ''
            };

            this.dialogController = dialogController;
            this.eventAggregator = eventAggregator;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ConfirmDialog.prototype.activate = function activate(viewModel) {
            this.vm = viewModel;
        };

        ConfirmDialog.prototype.confirm = function confirm(event) {
            this.dialogController.ok();
        };

        ConfirmDialog.prototype.cancel = function cancel(event) {
            this.dialogController.cancel();
        };

        return ConfirmDialog;
    }()) || _class);
});
define('components/views/edit-credentials/edit-credentials',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'util/common-models', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _commonModels, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EditCredentials = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EditCredentials = exports.EditCredentials = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EditCredentials(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EditCredentials);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        EditCredentials.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.credentialType = _commonModels.CredentialType.QUESTIONS;

                resolve();
            });
        };

        EditCredentials.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollChallengeQuestionAnswersComplete, function (message) {
                return _this2.onEnrollChallengeQuestionAnswersComplete(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollPhoneInfosComplete, function (message) {
                return _this2.onEnrollPhoneInfosComplete(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollEmailInfosComplete, function (message) {
                return _this2.onEnrollEmailInfosComplete(message);
            }));
        };

        EditCredentials.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        EditCredentials.prototype.onGoToEnrollChallengeQuestionAnswers = function onGoToEnrollChallengeQuestionAnswers(event) {
            this.editCredentialsViewModel = 'components/views/enroll-challenge-question-answers/enroll-challenge-question-answers';
        };

        EditCredentials.prototype.onEnrollChallengeQuestionAnswersComplete = function onEnrollChallengeQuestionAnswersComplete(message) {
            this.editCredentialsViewModel = null;
        };

        EditCredentials.prototype.onGoToEnrollPhoneInfos = function onGoToEnrollPhoneInfos(event) {
            this.editCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
        };

        EditCredentials.prototype.onEnrollPhoneInfosComplete = function onEnrollPhoneInfosComplete(message) {
            this.editCredentialsViewModel = null;
        };

        EditCredentials.prototype.onGoToEnrollEmailInfos = function onGoToEnrollEmailInfos(event) {
            this.editCredentialsViewModel = 'components/views/enroll-email-infos/enroll-email-infos';
        };

        EditCredentials.prototype.onEnrollEmailInfosComplete = function onEnrollEmailInfosComplete(message) {
            this.editCredentialsViewModel = null;
        };

        return EditCredentials;
    }()) || _class);
});
define('components/views/enroll-challenge-question-answers/enroll-challenge-question-answers',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'resources/messages/enrollment-messages'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _enrollmentMessages) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollChallengeQuestionAnswers = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollChallengeQuestionAnswers = exports.EnrollChallengeQuestionAnswers = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EnrollChallengeQuestionAnswers(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EnrollChallengeQuestionAnswers);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        EnrollChallengeQuestionAnswers.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.applyValidationRules();
                resolve();
            });
        };

        EnrollChallengeQuestionAnswers.prototype.applyValidationRules = function applyValidationRules() {
            for (var i = 0; i < this.vm.user.challengeQuestions.length; i++) {
                var challengeQuestion = this.vm.user.challengeQuestions[i];
                _aureliaValidation.ValidationRules.ensure('userAnswerText').required().on(challengeQuestion);
            }
        };

        EnrollChallengeQuestionAnswers.prototype.onSelectedAvailableChallengeQuestionAnswerChanged = function onSelectedAvailableChallengeQuestionAnswerChanged(event, bindingContext, selectedAvailableChallengeQuestion) {
            this.vm.user.updateAvailableChallengeQuestions(bindingContext.challengeQuestion, selectedAvailableChallengeQuestion);
        };

        EnrollChallengeQuestionAnswers.prototype.save = function save(event) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.controller.validate().then(function (controllerValidateResult) {
                    if (controllerValidateResult.valid) {
                        var challengeQuestionAnswers = _this2.vm.user.getChallengeQuestionAnswers();
                        var request = {
                            sessionId: _this2.vm.user.sessionId,
                            transactionId: _this2.vm.user.transactionId,
                            userId: _this2.vm.user.userId,
                            challengeQuestionAnswers: challengeQuestionAnswers
                        };
                        _this2.userService.addChallengeQuestionAnswers(request).then(function (response) {
                            _this2.notification.success('add-challenge-question-answers_success');
                            _this2.eventAggregator.publish(new _enrollmentMessages.EnrollChallengeQuestionAnswersComplete());
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            _this2.notification.error('add-challenge-question-answers_error');
                            reject(reason);
                        });
                    } else {
                        var validateError = new Error('validate_error');
                        _loggerHelper.logger.error(validateError);
                        _this2.notification.error('validate_error');
                        reject(validateError);
                    }
                }).catch(function (exception) {
                    _loggerHelper.logger.error(exception);
                    reject(exception);
                });
            });
        };

        return EnrollChallengeQuestionAnswers;
    }()) || _class);
});
define('components/views/enroll-email-infos/enroll-email-infos',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/window-helper', 'components/views/confirm-dialog/confirm-dialog', 'components/views/verify-email-info-dialog/verify-email-info-dialog', 'resources/messages/enrollment-messages', 'util/logger-helper', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _windowHelper, _confirmDialog, _verifyEmailInfoDialog, _enrollmentMessages, _loggerHelper, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollEmailInfos = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollEmailInfos = exports.EnrollEmailInfos = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService, _windowHelper.WindowHelper), _dec(_class = function () {
        function EnrollEmailInfos(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService, windowHelper) {
            _classCallCheck(this, EnrollEmailInfos);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.windowHelper = windowHelper;

            this.onKeypressInputCallback = this.onKeypressInput.bind(this);
        }

        EnrollEmailInfos.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.showEnrollEmailInfoWarning = true;
                _this.vm.emailAddress = '';
                _this.vm.emailAddressHasFocus = true;
                _this.vm.showAddEmailInfoForm = true;
                if (_this.vm.user.emailInfos.length > 0) {
                    _this.vm.showAddEmailInfoForm = false;
                } else {
                    _this.vm.emailAddressHasFocus = true;
                }
                _this.applyValidationRules();
                _this.windowHelper.addEventListener('keypress', _this.onKeypressInputCallback, false);
                resolve();
            });
        };

        EnrollEmailInfos.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('emailAddress').required().email().withMessage('${$value} is not a valid email address.').on(this.vm);
        };

        EnrollEmailInfos.prototype.deactivate = function deactivate() {
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
        };

        EnrollEmailInfos.prototype.onKeypressInput = function onKeypressInput(event) {
            if (typeof event !== 'undefined') {
                if (typeof event.target.id !== 'undefined') {
                    if (event.target.id === 'email-address-input') {
                        if (event.key === 'Enter') {
                            this.addEmailInfo();
                        }
                    }
                }
            }
        };

        EnrollEmailInfos.prototype.removeEmailInfo = function removeEmailInfo(event, contactInfo) {
            var _this2 = this;

            var confirmDialogModel = this.i18n.tr('confirm-remove-email-info-dialog', { returnObjects: true });
            confirmDialogModel.messageParams = {
                'emailAddress': contactInfo.emailAddress
            };
            return this.dialogService.open({ viewModel: _confirmDialog.ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (!openDialogResult.wasCancelled) {
                    _this2.onConfirmRemoveEmailInfo(contactInfo);
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this2.notification.error('logout_error');
            });
        };

        EnrollEmailInfos.prototype.onConfirmRemoveEmailInfo = function onConfirmRemoveEmailInfo(contactInfo) {
            var _this3 = this;

            var request = {
                userId: this.vm.userId,
                contactType: 'Email',
                contactInfo: contactInfo.emailAddress,
                label: contactInfo.label,
                verified: contactInfo.verified,
                hasActiveToken: contactInfo.hasActiveToken,
                isDefault: true
            };
            return this.userService.removeContactInfo(request).then(function (response) {
                _this3.vm.user.sessionId = response.sessionId;
                _this3.vm.user.transactionId = response.transactionId;
                _this3.notification.info('remove-contact-info_success');
                _this3.vm.user.emailInfos.splice(_lodash2.default.findIndex(_this3.vm.user.emailInfos, contactInfo), 1);
                _this3.eventAggregator.publish(new _enrollmentMessages.EnrollEmailInfosComplete());
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this3.notification.error('remove-contact-info_error');
            });
        };

        EnrollEmailInfos.prototype.isEmailAddressUnique = function isEmailAddressUnique(emailAddress) {
            var idx = _lodash2.default.findIndex(this.vm.user.emailInfos, function (s) {
                return s.label === emailAddress;
            });
            return idx < 0;
        };

        EnrollEmailInfos.prototype.addEmailInfo = function addEmailInfo(event) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (_this4.isEmailAddressUnique(_this4.vm.emailAddress)) {
                    _this4.controller.validate().then(function (result) {
                        if (result.valid) {
                            var request = {
                                userId: _this4.vm.user.userId,
                                credentialType: 'Email',
                                contactInfo: _this4.vm.emailAddress,
                                label: _this4.vm.emailAddress,
                                isDefault: true
                            };
                            _this4.userService.challengeUser(request).then(function (response) {
                                _this4.vm.user.sessionId = response.sessionId;
                                _this4.vm.user.transactionId = response.transactionId;
                                if (response.challengeStatus !== 'Deny') {
                                    _this4.goToVerifyEmailInfo(response);
                                } else {
                                    _this4.notification.error('challenge-user-deny_error');
                                }
                                resolve();
                            }).catch(function (reason) {
                                _loggerHelper.logger.error(reason);
                                _this4.notification.error('challenge-user_error');
                                reject(reason);
                            });
                        } else {
                            resolve();
                        }
                    }).catch(function (exception) {
                        _loggerHelper.logger.error(exception);
                        reject(exception);
                    });
                } else {
                    var duplicateEmailError = new Error('duplicate-email_error');
                    _this4.notification.error(duplicateEmailError);
                    reject(duplicateEmailError);
                }
            });
        };

        EnrollEmailInfos.prototype.goToVerifyEmailInfo = function goToVerifyEmailInfo(message) {
            var _this5 = this;

            var verifyEmailInfoModel = {
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
            return this.dialogService.open({ viewModel: _verifyEmailInfoDialog.VerifyEmailInfoDialog, model: verifyEmailInfoModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        _this5.notification.info('verify-email-info_resend');
                        _this5.addEmailInfo();
                    } else {
                        _this5.notification.info('verify-email-info_canceled');
                    }
                } else {
                    _this5.onVerifyEmailInfoSuccess(openDialogResult.output);
                    _this5.eventAggregator.publish(new _enrollmentMessages.EnrollEmailInfosComplete());
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this5.notification.info('verify-email-info_error');
            });
        };

        EnrollEmailInfos.prototype.onVerifyEmailInfoSuccess = function onVerifyEmailInfoSuccess(message) {
            if (message) {
                var emailInfo = {
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
        };

        return EnrollEmailInfos;
    }()) || _class);
});
define('components/views/enroll-phone-infos/enroll-phone-infos',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'util/window-helper', 'components/views/confirm-dialog/confirm-dialog', 'components/views/verify-phone-info-dialog/verify-phone-info-dialog', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _windowHelper, _confirmDialog, _verifyPhoneInfoDialog, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollPhoneInfos = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollPhoneInfos = exports.EnrollPhoneInfos = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService, _windowHelper.WindowHelper), _dec(_class = function () {
        function EnrollPhoneInfos(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService, windowHelper) {
            _classCallCheck(this, EnrollPhoneInfos);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.windowHelper = windowHelper;

            this.onKeypressInputCallback = this.onKeypressInput.bind(this);
        }

        EnrollPhoneInfos.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.showEnrollPhoneInfoWarning = true;
                _this.vm.phoneNumber = '';
                _this.vm.phoneNumberHasFocus = true;
                _this.vm.showAddPhoneInfoForm = true;
                if (_this.vm.user.smsInfos.length > 0) {
                    _this.vm.showAddPhoneInfoForm = false;
                } else {
                    _this.vm.phoneNumberHasFocus = true;
                }
                _this.applyValidationRules();
                _this.windowHelper.addEventListener('keypress', _this.onKeypressInputCallback, false);
                resolve();
            });
        };

        EnrollPhoneInfos.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('phoneNumber').required().minLength(10).maxLength(11).matches(/^\D?(\d{3})\D?\D?(\d{3})\D?\D?\D?(\d{4})$/).withMessage('${$value} is not a valid phone number.').on(this.vm);
        };

        EnrollPhoneInfos.prototype.deactivate = function deactivate() {
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
        };

        EnrollPhoneInfos.prototype.onKeypressInput = function onKeypressInput(event) {
            if (typeof event !== 'undefined') {
                if (typeof event.target.id !== 'undefined') {
                    if (event.target.id === 'phone-number-input') {
                        if (event.key === 'Enter') {
                            this.addPhoneInfo();
                        }
                    }
                }
            }
        };

        EnrollPhoneInfos.prototype.removePhoneInfo = function removePhoneInfo(event, contactInfo) {
            var _this2 = this;

            var confirmDialogModel = this.i18n.tr('confirm-remove-phone-info-dialog', { returnObjects: true });
            confirmDialogModel.messageParams = {
                'phoneNumber': contactInfo.phoneNumber
            };
            return this.dialogService.open({ viewModel: _confirmDialog.ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (!openDialogResult.wasCancelled) {
                    _this2.onConfirmRemovePhoneInfo(contactInfo);
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this2.notification.error('logout_error');
            });
        };

        EnrollPhoneInfos.prototype.onConfirmRemovePhoneInfo = function onConfirmRemovePhoneInfo(contactInfo) {
            var _this3 = this;

            var request = {
                userId: this.vm.userId,
                contactType: 'Phone',
                contactInfo: contactInfo.phoneNumber,
                label: contactInfo.label,
                verified: contactInfo.verified,
                hasActiveToken: contactInfo.hasActiveToken,
                isDefault: true
            };
            return this.userService.removeContactInfo(request).then(function (response) {
                _this3.vm.user.sessionId = response.sessionId;
                _this3.vm.user.transactionId = response.transactionId;
                _this3.notification.info('remove-contact-info_success');
                _this3.vm.user.smsInfos.splice(_lodash2.default.findIndex(_this3.vm.user.smsInfos, contactInfo), 1);
                _this3.eventAggregator.publish(new _enrollmentMessages.EnrollPhoneInfosComplete());
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this3.notification.error('remove-contact-info_error');
            });
        };

        EnrollPhoneInfos.prototype.isPhoneNumberUnique = function isPhoneNumberUnique(phoneNumber) {
            var idx = _lodash2.default.findIndex(this.vm.user.smsInfos, function (s) {
                return s.label === phoneNumber;
            });
            return idx < 0;
        };

        EnrollPhoneInfos.prototype.addPhoneInfo = function addPhoneInfo(event) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (_this4.isPhoneNumberUnique(_this4.vm.phoneNumber)) {
                    _this4.controller.validate().then(function (result) {
                        if (result.valid) {
                            var request = {
                                userId: _this4.vm.user.userId,
                                credentialType: 'SMS',
                                contactInfo: _this4.vm.phoneNumber,
                                label: _this4.vm.phoneNumber,
                                isDefault: true
                            };
                            _this4.userService.challengeUser(request).then(function (response) {
                                _this4.vm.user.sessionId = response.sessionId;
                                _this4.vm.user.transactionId = response.transactionId;
                                if (response.challengeStatus !== 'Deny') {
                                    _this4.goToVerifyPhoneInfo(response);
                                } else {
                                    _this4.notification.error('challenge-user-deny_error');
                                }
                                resolve();
                            }).catch(function (reason) {
                                _loggerHelper.logger.error(reason);
                                _this4.notification.error('challenge-user_error');
                                reject(reason);
                            });
                        } else {
                            resolve();
                        }
                    }).catch(function (exception) {
                        _loggerHelper.logger.error(exception);
                        reject(exception);
                    });
                } else {
                    var duplicatePhoneError = new Error('duplicate-phone_error');
                    _this4.notification.error(duplicatePhoneError);
                    reject(duplicatePhoneError);
                }
            });
        };

        EnrollPhoneInfos.prototype.goToVerifyPhoneInfo = function goToVerifyPhoneInfo(message) {
            var _this5 = this;

            var verifyPhoneInfoModel = {
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
            return this.dialogService.open({ viewModel: _verifyPhoneInfoDialog.VerifyPhoneInfoDialog, model: verifyPhoneInfoModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                if (openDialogResult.wasCancelled) {
                    if (openDialogResult.output && openDialogResult.output.resendCode) {
                        _this5.notification.info('verify-phone-info_resend');
                        _this5.addPhoneInfo();
                    } else {
                        _this5.notification.info('verify-phone-info_canceled');
                    }
                } else {
                    _this5.onVerifyPhoneInfoSuccess(openDialogResult.output);
                    _this5.eventAggregator.publish(new _enrollmentMessages.EnrollPhoneInfosComplete());
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this5.notification.info('verify-phone-info_error');
            });
        };

        EnrollPhoneInfos.prototype.onVerifyPhoneInfoSuccess = function onVerifyPhoneInfoSuccess(message) {
            if (message) {
                var phoneInfo = {
                    phoneNumber: message.contactInfo,
                    label: message.contactInfo,
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
        };

        return EnrollPhoneInfos;
    }()) || _class);
});
define('components/views/enrollment/enroll-credentials',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'components/views/confirm-dialog/confirm-dialog', 'util/logger-helper', 'util/common-models', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _confirmDialog, _loggerHelper, _commonModels, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollCredentials = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _dec, _class;

    var EnrollCredentials = exports.EnrollCredentials = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EnrollCredentials(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EnrollCredentials);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        EnrollCredentials.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.credentialType = _commonModels.CredentialType.QUESTIONS;
                _this.enrollCredentialsViewModel = 'components/views/enroll-challenge-question-answers/enroll-challenge-question-answers';
                resolve();
            });
        };

        EnrollCredentials.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollChallengeQuestionAnswersComplete, function (message) {
                return _this2.onEnrollChallengeQuestionAnswersComplete(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollPhoneInfosComplete, function (message) {
                return _this2.onEnrollPhoneInfosComplete(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollEmailInfosComplete, function (message) {
                return _this2.onEnrollEmailInfosComplete(message);
            }));
        };

        EnrollCredentials.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        EnrollCredentials.prototype.skip = function skip(event) {
            var _this3 = this;

            if (this.vm.credentialType === _commonModels.CredentialType.QUESTIONS) {
                this.eventAggregator.publish(new _enrollmentMessages.EnrollCredentialsComplete({ credentialType: _commonModels.CredentialType.QUESTIONS }));
            } else {
                var confirmDialogModel = void 0;
                if (this.vm.credentialType === _commonModels.CredentialType.PHONE) {
                    confirmDialogModel = this.i18n.tr('confirm-skip-enroll-phone-infos-dialog', { returnObjects: true });
                } else if (this.vm.credentialType === _commonModels.CredentialType.EMAIL) {
                    confirmDialogModel = this.i18n.tr('confirm-skip-enroll-email-infos-dialog', { returnObjects: true });
                }
                return this.dialogService.open({ viewModel: _confirmDialog.ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                    if (!openDialogResult.wasCancelled) {
                        _this3.next(event);
                    }
                }).catch(function (reason) {
                    _loggerHelper.logger.error(reason);
                    _this3.notification.error('confirm_error');
                });
            }
        };

        EnrollCredentials.prototype.next = function next(event) {
            if (this.vm.credentialType === _commonModels.CredentialType.QUESTIONS) {
                this.vm.credentialType = _commonModels.CredentialType.PHONE;
                this.enrollCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
            } else if (this.vm.credentialType === _commonModels.CredentialType.PHONE) {
                this.vm.credentialType = _commonModels.CredentialType.EMAIL;
                this.enrollCredentialsViewModel = 'components/views/enroll-email-infos/enroll-email-infos';
            } else if (this.vm.credentialType === _commonModels.CredentialType.EMAIL) {
                this.vm.credentialType = _commonModels.CredentialType.QUESTIONS;
                this.enrollCredentialsViewModel = 'components/views/enroll-phone-infos/enroll-phone-infos';
                this.eventAggregator.publish(new _enrollmentMessages.EnrollCredentialsComplete());
            }
        };

        EnrollCredentials.prototype.onEnrollChallengeQuestionAnswersComplete = function onEnrollChallengeQuestionAnswersComplete(message) {};

        EnrollCredentials.prototype.onEnrollPhoneInfosComplete = function onEnrollPhoneInfosComplete(message) {};

        EnrollCredentials.prototype.onEnrollEmailInfosComplete = function onEnrollEmailInfosComplete(message) {};

        _createClass(EnrollCredentials, [{
            key: 'enrollCredentialsComplete',
            get: function get() {
                var credentialsComplete = false;
                if (this.vm.credentialType === _commonModels.CredentialType.QUESTIONS) {
                    credentialsComplete = this.vm.user.challengeQuestionAnswersComplete;
                } else if (this.vm.credentialType === _commonModels.CredentialType.PHONE) {
                    credentialsComplete = this.vm.user.smsInfosComplete;
                } else if (this.vm.credentialType === _commonModels.CredentialType.EMAIL) {
                    credentialsComplete = this.vm.user.emailInfosComplete;
                }
                return credentialsComplete;
            }
        }]);

        return EnrollCredentials;
    }()) || _class);
});
define('components/views/enrollment/enrollment-disclaimer',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'util/event-timer', 'config/app', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _eventTimer, _app, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollmentDisclaimer = undefined;

    var _eventTimer2 = _interopRequireDefault(_eventTimer);

    var _app2 = _interopRequireDefault(_app);

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollmentDisclaimer = exports.EnrollmentDisclaimer = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EnrollmentDisclaimer(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EnrollmentDisclaimer);

            this.eventTimerStartTime = _app2.default.enrollment.confirmDisclaimerEventTimerStartTime || 5;
            this.eventTimerTickKey = 'enrollment-disclaimer-tick';
            this.eventTimerTimeoutKey = 'enrollment-disclaimer-timeout';
            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            this.timer = new _eventTimer2.default(this.eventAggregator);
        }

        EnrollmentDisclaimer.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('confirmDisclaimerChecked').equals(true).on(this.vm);
        };

        EnrollmentDisclaimer.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.confirmDisclaimerChecked = false;
                _this.vm.eventTimerExpired = false;
                _this.vm.remainingTime = _this.eventTimerStartTime;
                _this.timer.start(_this.eventTimerStartTime, _this.eventTimerTickKey, _this.eventTimerTimeoutKey);
                _this.applyValidationRules();
                resolve();
            });
        };

        EnrollmentDisclaimer.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTickKey, function (startTime) {
                return _this2.onEventTimerTick(startTime);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTimeoutKey, function (startTime) {
                return _this2.onEventTimerTimeout(startTime);
            }));
        };

        EnrollmentDisclaimer.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        EnrollmentDisclaimer.prototype.deactivate = function deactivate() {
            this.timer.stop();
        };

        EnrollmentDisclaimer.prototype.onEventTimerTick = function onEventTimerTick(startTime) {
            this.vm.remainingTime = startTime;
        };

        EnrollmentDisclaimer.prototype.onEventTimerTimeout = function onEventTimerTimeout(startTime) {
            this.vm.eventTimerExpired = true;
        };

        EnrollmentDisclaimer.prototype.next = function next(event) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (controllerValidateResult) {
                    if (controllerValidateResult.valid) {
                        _this3.eventAggregator.publish(new _enrollmentMessages.EnrollmentDisclaimerConfirmed());
                    }
                    resolve();
                }).catch(function (reason) {
                    _loggerHelper.logger.error(reason);
                    reject(reason);
                });
            });
        };

        return EnrollmentDisclaimer;
    }()) || _class);
});
define('components/views/enrollment/enrollment-intro',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'resources/messages/enrollment-messages', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _enrollmentMessages, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollmentIntro = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollmentIntro = exports.EnrollmentIntro = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EnrollmentIntro(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EnrollmentIntro);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        EnrollmentIntro.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                resolve();
            });
        };

        EnrollmentIntro.prototype.start = function start(event) {
            var _this2 = this;

            return new Promise(function (resolve) {
                _this2.eventAggregator.publish(new _enrollmentMessages.EnrollmentStart());
                resolve();
            });
        };

        return EnrollmentIntro;
    }()) || _class);
});
define('components/views/enrollment/enrollment-review',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'components/views/confirm-dialog/confirm-dialog', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _confirmDialog, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnrollmentReview = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var EnrollmentReview = exports.EnrollmentReview = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function EnrollmentReview(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, EnrollmentReview);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        EnrollmentReview.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                resolve();
            });
        };

        EnrollmentReview.prototype.done = function done(event) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                if (_this2.vm.challengeQuestionAnswersComplete && _this2.vm.user.smsInfosComplete && _this2.vm.user.emailInfosComplete) {
                    _this2.eventAggregator.publish(new EnrollmentDone());
                    resolve();
                } else {
                    var confirmDialogModel = _this2.i18n.tr('confirm-enrollment-review-warning-dialog', { returnObjects: true });
                    _this2.dialogService.open({ viewModel: _confirmDialog.ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false }).whenClosed(function (openDialogResult) {
                        if (!openDialogResult.wasCancelled) {
                            _this2.eventAggregator.publish(new _enrollmentMessages.EnrollmentComplete());
                        }
                        resolve();
                    }).catch(function (reason) {
                        _loggerHelper.logger.error(reason);
                        _this2.notification.error('confirm_error');
                        reject(reason);
                    });
                }
            });
        };

        return EnrollmentReview;
    }()) || _class);
});
define('components/views/enrollment/enrollment',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'models/user', 'util/logger-helper', 'resources/messages/enrollment-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _user, _loggerHelper, _enrollmentMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Enrollment = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Enrollment = exports.Enrollment = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function Enrollment(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, Enrollment);

            this.vm = {
                user: new _user.User()
            };
            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            var payload = authService.getTokenPayload();
            this.vm.user.fromJson(payload);
        }

        Enrollment.prototype.activate = function activate(params, routeConfig, navigationInstruction) {
            var _this = this;

            var request = {
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId,
                userId: this.vm.user.userId
            };
            return this.userService.getUser(request).then(function (response) {
                _this.vm.user.fromJson(response);
                _this.enrollmentViewModel = './enrollment-disclaimer';
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this.notification.error('get-user_error');
            });
        };

        Enrollment.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollmentDisclaimerConfirmed, function (message) {
                return _this2.onEnrollmentDisclaimerConfirmed(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollmentStart, function (message) {
                return _this2.onEnrollmentStart(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollCredentialsComplete, function (message) {
                return _this2.onEnrollCredentialsComplete(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_enrollmentMessages.EnrollmentComplete, function (message) {
                return _this2.onEnrollmentComplete(message);
            }));
        };

        Enrollment.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        Enrollment.prototype.onEnrollmentDisclaimerConfirmed = function onEnrollmentDisclaimerConfirmed(message) {
            this.enrollmentViewModel = './enrollment-intro';
        };

        Enrollment.prototype.onEnrollmentStart = function onEnrollmentStart(message) {
            this.enrollmentViewModel = './enroll-credentials';
        };

        Enrollment.prototype.onEnrollCredentialsComplete = function onEnrollCredentialsComplete(message) {
            this.enrollmentViewModel = './enrollment-review';
        };

        Enrollment.prototype.onEnrollmentComplete = function onEnrollmentComplete(message) {
            this.router.navigateToRoute('self-service');
        };

        return Enrollment;
    }()) || _class);
});
define('components/views/login/challenge-with-credentials',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper', 'resources/messages/login-messages', 'resources/messages/challenge-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper, _loginMessages, _challengeMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ChallengeWithCredentials = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ChallengeWithCredentials = exports.ChallengeWithCredentials = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function ChallengeWithCredentials(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, ChallengeWithCredentials);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        ChallengeWithCredentials.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                if (_this.vm.selectedCredentialType === 'challenge-questions') {
                    _this.challengePreAuthUser('Questions').then(function (response) {
                        _this.challengeWithCredentialsViewModel = 'components/views/challenge-with-challenge-questions/challenge-with-challenge-questions';
                        resolve();
                    });
                } else if (_this.vm.selectedCredentialType === 'phone-info') {
                    _this.getPreAuthUser('Phone').then(function (response) {
                        _this.challengeWithCredentialsViewModel = 'components/views/challenge-with-phone-info/challenge-with-phone-info';
                        resolve();
                    });
                } else if (_this.vm.selectedCredentialType === 'email-info') {
                    _this.challengeWithCredentialsViewModel = 'components/views/challenge-with-email-info/challenge-with-email-info';
                } else if (_this.vm.selectedCredentialType === 'rsa-token') {
                    _this.challengeWithCredentialsViewModel = 'components/views/challenge-with-rsa-token/challenge-with-rsa-token';
                } else {
                    _this.eventAggregator.publish(new _challengeMessages.ChallengeFail());
                }
            });
        };

        ChallengeWithCredentials.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(_challengeMessages.ChallengeStart, function (message) {
                return _this2.onChallengeStart(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_challengeMessages.ChallengeCancel, function (message) {
                return _this2.onChallengeCancel(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_challengeMessages.ChallengeSuccess, function (message) {
                return _this2.onChallengeSuccess(message);
            }));
        };

        ChallengeWithCredentials.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        ChallengeWithCredentials.prototype.getPreAuthUser = function getPreAuthUser(credentialType) {
            var _this3 = this;

            var request = {
                userId: this.vm.user.userId,
                credentialType: credentialType,
                access_token: this.vm.user.access_token
            };
            return this.userService.getPreAuthUser(request).then(function (response) {
                _this3.vm.user.fromJson(response);
                return response;
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this3.notification.error('get-user_error');
            });
        };

        ChallengeWithCredentials.prototype.onChallengeStart = function onChallengeStart(message) {
            var _this4 = this;

            if (message) {
                this.challengePreAuthUser(message.credentialType, message.label).then(function (response) {
                    _this4.eventAggregator.publish(new ChallengeReceived(response));
                });
            }
        };

        ChallengeWithCredentials.prototype.challengePreAuthUser = function challengePreAuthUser(credentialType, label) {
            var _this5 = this;

            var request = {
                userId: this.vm.user.userId,
                credentialType: credentialType,
                access_token: this.vm.user.access_token
            };
            if (label) {
                request.label = label;
            }
            return this.userService.challengePreAuthUser(request).then(function (response) {
                if (response.challengeStatus !== 'Deny') {
                    _this5.vm.user.fromJson(response);
                    return response;
                } else {
                    _this5.notification.error('challenge-user_error');
                }
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this5.notification.error('challenge-user_error');
            });
        };

        ChallengeWithCredentials.prototype.onChallengeVerify = function onChallengeVerify(message) {
            var _this6 = this;

            if (message) {
                this.authenticatePreAuthUser(message.credentialType, message.credentials).then(function (response) {
                    _this6.eventAggregator.publish(new ChallengeVerify(response));
                });
            }
        };

        ChallengeWithCredentials.prototype.authenticatePreAuthUser = function authenticatePreAuthUser(credentialType, credentials) {
            var _this7 = this;

            var request = {
                userId: this.vm.user.userId,
                credentialType: credentialType,
                credentials: credentials,
                access_token: this.vm.user.access_token
            };
            return this.userService.authenticatePreAuthUser(request).then(function (response) {
                return response;
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this7.notification.error('verify-phone-info_error');
                reject(reason);
            });
        };

        ChallengeWithCredentials.prototype.onChallengeCancel = function onChallengeCancel() {
            this.eventAggregator.publish(new _loginMessages.GoToLogout());
        };

        ChallengeWithCredentials.prototype.onChallengeSuccess = function onChallengeSuccess(message) {
            this.eventAggregator.publish(new _loginMessages.AuthenticateUserSuccess(message));
        };

        ChallengeWithCredentials.prototype.onChallengeFail = function onChallengeFail(message) {
            this.vm.user.sessionId = '';
            this.vm.user.transactionId = '';
            this.eventAggregator.publish(new _loginMessages.AuthenticateUserFail(message));
        };

        return ChallengeWithCredentials;
    }()) || _class);
});
define('components/views/login/challenge',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'resources/messages/login-messages', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loginMessages, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Challenge = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Challenge = exports.Challenge = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function Challenge(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, Challenge);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        Challenge.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.vm.bindDeviceOptions = ['yes', 'no'];
                _this.applyValidationRules();
                resolve();
            });
        };

        Challenge.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('selectedCredentialType').required().on(this.vm);
        };

        Challenge.prototype.cancel = function cancel(event) {
            var _this2 = this;

            return new Promise(function (resolve) {
                _this2.eventAggregator.publish(new _loginMessages.GoToLogout());
                resolve();
            });
        };

        Challenge.prototype.next = function next(event) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (result) {
                    if (result.valid) {
                        _this3.eventAggregator.publish(new _loginMessages.ChallengeWithCredentials());
                    }
                    resolve();
                }).catch(function (reason) {
                    _loggerHelper.logger.error(reason);
                    reject(reason);
                });
            });
        };

        return Challenge;
    }()) || _class);
});
define('components/views/login/deny',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Deny = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Deny = exports.Deny = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function Deny(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, Deny);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
        }

        Deny.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                resolve();
            });
        };

        return Deny;
    }()) || _class);
});
define('components/views/login/login',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'models/user', 'util/logger-helper', 'resources/messages/login-messages', 'lodash'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _user, _loggerHelper, _loginMessages, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Login = undefined;

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Login = exports.Login = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function Login(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, Login);

            this.vm = {
                user: new _user.User()
            };
            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            this.loginViewModel = './network-credentials';
        }

        Login.prototype.attached = function attached() {
            var _this = this;

            this.subscribers.push(this.eventAggregator.subscribe(_loginMessages.GoToLogin, function (message) {
                return _this.onGoToLogin(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_loginMessages.SigninSuccess, function (message) {
                return _this.onSigninSuccess(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_loginMessages.AuthenticateUserSuccess, function (message) {
                return _this.onAuthenticateUserSuccess(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_loginMessages.ChallengeWithCredentials, function (message) {
                return _this.onChallengeWithCredentials(message);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(_loginMessages.GoToForgotPassword, function (message) {
                return _this.onGoToForgotPassword(message);
            }));
        };

        Login.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        Login.prototype.onGoToLogin = function onGoToLogin(message) {
            this.router.navigateToRoute('logout');
        };

        Login.prototype.onSigninSuccess = function onSigninSuccess(message) {
            var _this2 = this;

            if (message && message.authStatusCode === 'Challenge' && message.userStatus === 'Verified') {
                this.vm.user.fromJson(message);
                this.loginViewModel = './challenge';
            } else if (message.authStatusCode === 'Success' && message.userStatus === 'Verified') {
                this.onAuthenticateUserSuccess(message).then(function (response) {
                    _this2.router.navigateToRoute('self-service');
                });
            } else if (message.authStatusCode === 'Success' && message.userStatus === 'Unverified') {
                this.onAuthenticateUserSuccess(message).then(function (response) {
                    _this2.router.navigateToRoute('enrollment');
                });
            } else {
                this.loginViewModel = './deny';
            }
        };

        Login.prototype.onChallengeWithCredentials = function onChallengeWithCredentials() {
            this.loginViewModel = './challenge-with-credentials';
        };

        Login.prototype.onAuthenticateUserSuccess = function onAuthenticateUserSuccess(message) {
            var request = {
                username: this.vm.user.userId,
                password: this.vm.user.credentials
            };
            return this.authService.login(request);
        };

        Login.prototype.onGoToForgotPassword = function onGoToForgotPassword(message) {
            this.router.navigateToRoute('forgot-password');
        };

        return Login;
    }()) || _class);
});
define('components/views/login/network-credentials',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/window-helper', 'resources/messages/login-messages', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _windowHelper, _loginMessages, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.NetworkCredentials = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var NetworkCredentials = exports.NetworkCredentials = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService, _windowHelper.WindowHelper), _dec(_class = function () {
        function NetworkCredentials(router, eventAggregator, controllerFactory, dialogService, notification, i18n, authService, userService, windowHelper) {
            _classCallCheck(this, NetworkCredentials);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.windowHelper = windowHelper;

            this.onKeypressInputCallback = this.onKeypressInput.bind(this);
        }

        NetworkCredentials.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.applyValidationRules();
                _this.vm.userIdHasFocus = true;
                _this.windowHelper.addEventListener('keypress', _this.onKeypressInputCallback, false);
                resolve();
            });
        };

        NetworkCredentials.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('userId').required().minLength(1).maxLength(256).ensure('credentials').required().minLength(1).maxLength(256).on(this.vm.user);
        };

        NetworkCredentials.prototype.deactivate = function deactivate() {
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
        };

        NetworkCredentials.prototype.onKeypressInput = function onKeypressInput(event) {
            if (typeof event !== 'undefined') {
                if (typeof event.target.id !== 'undefined') {
                    if (event.target.id === 'credentials-input') {
                        if (event.key === 'Enter') {
                            this.signin();
                        }
                    }
                }
            }
        };

        NetworkCredentials.prototype.signin = function signin(event) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.controller.validate().then(function (result) {
                    if (result.valid) {
                        var request = {
                            sessionId: _this2.vm.user.sessionId,
                            transactionId: _this2.vm.user.transactionId,
                            userId: _this2.vm.user.userId,
                            credentials: _this2.vm.user.credentials
                        };
                        _this2.userService.signin(request).then(function (response) {
                            _this2.eventAggregator.publish(new _loginMessages.SigninSuccess(response));
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            reject(reason);
                        });
                    } else {
                        resolve();
                    }
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    reject(validateReason);
                });
            });
        };

        NetworkCredentials.prototype.goToForgotPassword = function goToForgotPassword(event) {
            this.eventAggregator.publish(new _loginMessages.GoToForgotPassword());
        };

        return NetworkCredentials;
    }()) || _class);
});
define('components/views/logout/logout',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Logout = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Logout = exports.Logout = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function Logout(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, Logout);

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.authService = authService;
        }

        Logout.prototype.activate = function activate() {
            return this.authService.logout();
        };

        return Logout;
    }()) || _class);
});
define('components/views/self-service/self-service',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'models/user', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _user, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SelfService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var SelfService = exports.SelfService = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function SelfService(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, SelfService);

            this.vm = {
                user: new _user.User()
            };
            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            var payload = this.authService.getTokenPayload();
            this.vm.user.fromJson(payload);
        }

        SelfService.prototype.activate = function activate(params, routeConfig, navigationInstruction) {
            var _this = this;

            var request = {
                userId: this.vm.user.userId
            };
            return this.userService.getUser(request).then(function (response) {
                _this.vm.user.fromJson(response);
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this.notification.error('get-user_error');
            });
        };

        SelfService.prototype.goToChangePassword = function goToChangePassword(event) {
            this.router.navigateToRoute('change-password');
        };

        SelfService.prototype.goToEditProfile = function goToEditProfile(event) {
            this.router.navigateToRoute('edit-credentials');
        };

        SelfService.prototype.goToUnlockAccount = function goToUnlockAccount(event) {
            this.router.navigateToRoute('unlock-account');
        };

        return SelfService;
    }()) || _class);
});
define('components/views/unlock-account/unlock-account',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-event-aggregator', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'models/user', 'util/logger-helper'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaEventAggregator, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _user, _loggerHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UnlockAccount = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var UnlockAccount = exports.UnlockAccount = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaDialog.DialogService, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService), _dec(_class = function () {
        function UnlockAccount(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
            _classCallCheck(this, UnlockAccount);

            this.subscribers = [];

            this.router = router;
            this.eventAggregator = eventAggregator;
            this.dialogService = dialogService;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;

            var payload = authService.getTokenPayload();
            this.vm.user.userId = payload ? payload.username : null;
        }

        UnlockAccount.prototype.activate = function activate(params, routeConfig, navigationInstruction) {
            var _this = this;

            var request = {
                sessionId: this.vm.user.sessionId,
                transactionId: this.vm.user.transactionId,
                userId: this.vm.user.userId
            };
            return this.userService.getUser(request).then(function (response) {
                _this.vm.user = new _user.User();
                _this.vm.user.fromJson(response);
            }).catch(function (reason) {
                _loggerHelper.logger.error(reason);
                _this.notification.error('get-user_error');
            });
        };

        return UnlockAccount;
    }()) || _class);
});
define('components/views/verify-email-info-dialog/verify-email-info-dialog',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/window-helper', 'util/logger-helper', 'util/event-timer', 'config/app', 'lodash'], function (exports, _aureliaFramework, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _windowHelper, _loggerHelper, _eventTimer, _app, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.VerifyEmailInfoDialog = undefined;

    var _eventTimer2 = _interopRequireDefault(_eventTimer);

    var _app2 = _interopRequireDefault(_app);

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var VerifyEmailInfoDialog = exports.VerifyEmailInfoDialog = (_dec = (0, _aureliaFramework.inject)(_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService, _windowHelper.WindowHelper), _dec(_class = function () {
        function VerifyEmailInfoDialog(dialogController, eventAggregator, controllerFactory, notification, i18n, authService, userService, windowHelper) {
            _classCallCheck(this, VerifyEmailInfoDialog);

            this.eventTimerStartTime = _app2.default.enrollment.verifyEmailInfoTimerStartTime || 120;
            this.eventTimerTickKey = 'verify-email-info_tick';
            this.eventTimerTimeoutKey = 'verify-email-info_timeout';
            this.subscribers = [];

            this.dialogController = dialogController;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.windowHelper = windowHelper;

            this.onKeypressInputCallback = this.onKeypressInput.bind(this);
            this.timer = new _eventTimer2.default(this.eventAggregator);
        }

        VerifyEmailInfoDialog.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.applyValidationRules();
                _this.vm.remainingTime = _this.eventTimerStartTime;
                _this.timer.start(_this.eventTimerStartTime, _this.eventTimerTickKey, _this.eventTimerTimeoutKey);

                _this.windowHelper.addEventListener('keypress', _this.onKeypressInputCallback, false);
                resolve();
            });
        };

        VerifyEmailInfoDialog.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('verificationCode').required().minLength(8).maxLength(8).on(this.vm);
        };

        VerifyEmailInfoDialog.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTickKey, function (startTime) {
                return _this2.onEventTimerTick(startTime);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTimeoutKey, function (startTime) {
                return _this2.onEventTimerTimeout(startTime);
            }));
        };

        VerifyEmailInfoDialog.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        VerifyEmailInfoDialog.prototype.deactivate = function deactivate() {
            this.timer.stop();
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
        };

        VerifyEmailInfoDialog.prototype.onKeypressInput = function onKeypressInput(event) {
            if (typeof event !== 'undefined') {
                if (typeof event.target.id !== 'undefined') {
                    if (event.target.id === 'verification-code') {
                        if (event.key === 'Enter') {
                            this.verify();
                        }
                    }
                }
            }
        };

        VerifyEmailInfoDialog.prototype.onEventTimerTick = function onEventTimerTick(startTime) {
            this.vm.remainingTime = startTime;
        };

        VerifyEmailInfoDialog.prototype.onEventTimerTimeout = function onEventTimerTimeout(startTime) {
            this.vm.eventTimerExpired = true;
        };

        VerifyEmailInfoDialog.prototype.cancel = function cancel(event) {
            this.dialogController.cancel();
        };

        VerifyEmailInfoDialog.prototype.resendCode = function resendCode(event) {
            var response = {
                resendCode: true
            };
            this.dialogController.cancel(response);
        };

        VerifyEmailInfoDialog.prototype.verify = function verify(event) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (result) {
                    if (result.valid) {
                        var request = {
                            sessionId: _this3.vm.user.sessionId,
                            transactionId: _this3.vm.user.transactionId,
                            userId: _this3.vm.user.userId,
                            contactType: 'Email',
                            contactInfo: _this3.vm.emailAddress,
                            label: _this3.vm.emailAddress,
                            token: _this3.vm.verificationCode
                        };
                        _this3.userService.verifyContactInfo(request).then(function (response) {
                            if (response.verified) {
                                _this3.dialogController.ok(response);
                            } else {
                                _this3.notification.error('verify-email-info-fail_error');
                            }
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            _this3.notification.error('verify-email-info_error');
                            reject(reason);
                        });
                    } else {
                        resolve();
                    }
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    reject(validateReason);
                });
            });
        };

        return VerifyEmailInfoDialog;
    }()) || _class);
});
define('components/views/verify-phone-info-dialog/verify-phone-info-dialog',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'aurelia-validation', 'aurelia-dialog', 'aurelia-notification', 'aurelia-i18n', 'aurelia-authentication', 'services/user-service', 'util/window-helper', 'util/logger-helper', 'util/event-timer', 'config/app', 'lodash'], function (exports, _aureliaFramework, _aureliaEventAggregator, _aureliaValidation, _aureliaDialog, _aureliaNotification, _aureliaI18n, _aureliaAuthentication, _userService, _windowHelper, _loggerHelper, _eventTimer, _app, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.VerifyPhoneInfoDialog = undefined;

    var _eventTimer2 = _interopRequireDefault(_eventTimer);

    var _app2 = _interopRequireDefault(_app);

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var VerifyPhoneInfoDialog = exports.VerifyPhoneInfoDialog = (_dec = (0, _aureliaFramework.inject)(_aureliaDialog.DialogController, _aureliaEventAggregator.EventAggregator, _aureliaValidation.ValidationControllerFactory, _aureliaNotification.Notification, _aureliaI18n.I18N, _aureliaAuthentication.AuthService, _userService.UserService, _windowHelper.WindowHelper), _dec(_class = function () {
        function VerifyPhoneInfoDialog(dialogController, eventAggregator, controllerFactory, notification, i18n, authService, userService, windowHelper) {
            _classCallCheck(this, VerifyPhoneInfoDialog);

            this.eventTimerStartTime = _app2.default.enrollment.verifyPhoneInfoTimerStartTime || 120;
            this.eventTimerTickKey = 'verify-phone-info_tick';
            this.eventTimerTimeoutKey = 'verify-phone-info_timeout';
            this.subscribers = [];

            this.dialogController = dialogController;
            this.eventAggregator = eventAggregator;
            this.controller = controllerFactory.createForCurrentScope();
            this.controller.validateTrigger = _aureliaValidation.validateTrigger.manual;
            this.notification = notification;
            this.i18n = i18n;
            this.authService = authService;
            this.userService = userService;
            this.windowHelper = windowHelper;

            this.onKeypressInputCallback = this.onKeypressInput.bind(this);
            this.timer = new _eventTimer2.default(this.eventAggregator);
        }

        VerifyPhoneInfoDialog.prototype.activate = function activate(viewModel) {
            var _this = this;

            return new Promise(function (resolve) {
                _this.vm = viewModel;
                _this.applyValidationRules();
                _this.vm.remainingTime = _this.eventTimerStartTime;
                _this.timer.start(_this.eventTimerStartTime, _this.eventTimerTickKey, _this.eventTimerTimeoutKey);

                _this.windowHelper.addEventListener('keypress', _this.onKeypressInputCallback, false);
                resolve();
            });
        };

        VerifyPhoneInfoDialog.prototype.applyValidationRules = function applyValidationRules() {
            _aureliaValidation.ValidationRules.ensure('verificationCode').required().minLength(8).maxLength(8).on(this.vm);
        };

        VerifyPhoneInfoDialog.prototype.attached = function attached() {
            var _this2 = this;

            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTickKey, function (startTime) {
                return _this2.onEventTimerTick(startTime);
            }));
            this.subscribers.push(this.eventAggregator.subscribe(this.eventTimerTimeoutKey, function (startTime) {
                return _this2.onEventTimerTimeout(startTime);
            }));
        };

        VerifyPhoneInfoDialog.prototype.detached = function detached() {
            _lodash2.default.each(this.subscribers, function (subscriber) {
                if (subscriber && subscriber.dispose) {
                    subscriber.dispose();
                }
            });
        };

        VerifyPhoneInfoDialog.prototype.deactivate = function deactivate() {
            this.timer.stop();
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
        };

        VerifyPhoneInfoDialog.prototype.onKeypressInput = function onKeypressInput(event) {
            if (typeof event !== 'undefined') {
                if (typeof event.target.id !== 'undefined') {
                    if (event.target.id === 'verification-code') {
                        if (event.key === 'Enter') {
                            this.verify();
                        }
                    }
                }
            }
        };

        VerifyPhoneInfoDialog.prototype.onEventTimerTick = function onEventTimerTick(startTime) {
            this.vm.remainingTime = startTime;
        };

        VerifyPhoneInfoDialog.prototype.onEventTimerTimeout = function onEventTimerTimeout(startTime) {
            this.vm.eventTimerExpired = true;
        };

        VerifyPhoneInfoDialog.prototype.cancel = function cancel(event) {
            this.dialogController.cancel();
        };

        VerifyPhoneInfoDialog.prototype.resendCode = function resendCode(event) {
            var response = {
                resendCode: true
            };
            this.dialogController.cancel(response);
        };

        VerifyPhoneInfoDialog.prototype.verify = function verify(event) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.controller.validate().then(function (result) {
                    if (result.valid) {
                        var request = {
                            sessionId: _this3.vm.user.sessionId,
                            transactionId: _this3.vm.user.transactionId,
                            userId: _this3.vm.user.userId,
                            contactType: 'SMS',
                            contactInfo: _this3.vm.phoneNumber,
                            label: _this3.vm.phoneNumber,
                            token: _this3.vm.verificationCode
                        };
                        _this3.userService.verifyContactInfo(request).then(function (response) {
                            if (response.verified) {
                                _this3.dialogController.ok(response);
                            } else {
                                _this3.notification.error('verify-phone-info-fail_error');
                            }
                            resolve();
                        }).catch(function (reason) {
                            _loggerHelper.logger.error(reason);
                            _this3.notification.error('verify-phone-info_error');
                            reject(reason);
                        });
                    } else {
                        resolve();
                    }
                }).catch(function (validateReason) {
                    _loggerHelper.logger.error(validateReason);
                    reject(validateReason);
                });
            });
        };

        return VerifyPhoneInfoDialog;
    }()) || _class);
});
define('text!app/app.html', ['module'], function(module) { module.exports = "<template><require from=./reset.css></require><require from=./app.css#ux></require><section styles.main><nav-bar router.bind=router username.bind=username></nav-bar><router-view styles.page></router-view><site-footer router.bind=router languages.bind=languages></site-footer></section></template>"; });
define('text!components/nav-bar/nav-bar.html', ['module'], function(module) { module.exports = "<template bindable=router><nav styles.nav><span styles.product-name>Aurelia UX</span><ul styles.nav-list><li styles.nav-item repeat.for=\"row of router.navigation | authFilter: isAuthenticated\" class=\"${nav.isActive ? 'active' : ''}\"><a href.bind=row.href t.bind=row.settings.t>${row.title}</a></li></ul></nav><a class=top click.trigger=goToLogout($event) if.bind=isAuthenticated><span t=go-to-logout_button></span></a><header styles.header><h1>${router.currentInstruction.config.navModel.title}</h1></header><loading-indicator loading.bind=\"router.isNavigating || api.isRequesting\"></loading-indicator></template>"; });
define('text!components/site-footer/site-footer.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 columns\"><span class=\"text-center copyright\"><i t=[class]copyright_icon></i><span t=copyright_message></span></span></div></div></template>"; });
define('text!components/validation-summary/validation-summary.html', ['module'], function(module) { module.exports = "<template bindable=\"errors, autofocus\"><div class=\"alert callout\" show.bind=errors.length focus.one-way=\"autofocus && errors.length > 0\"><ul class=no-bullet><li repeat.for=\"errorInfo of errors\"><a class=\"c-cta c-cta--alert\" href=# click.delegate=errorInfo.targets[0].focus()>${errorInfo.error.message}</a></li></ul></div></template>"; });
define('text!components/views/challenge-with-challenge-questions/challenge-with-challenge-questions.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]challenge-questions_icon></i><span t=challenge-with-challenge-questions_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]challenge-with-challenge-questions_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=fieldset><validation-summary errors.bind=errors autofocus.bind=\"controller.validateTrigger === 'manual'\"></validation-summary><div class=u-gutt-3 repeat.for=\"challengeQuestion of vm.user.challengeQuestions\"><div class=form-row><label for=\"challenge-question-input-${$index}\" t=challenge-question_label></label><select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=challengeQuestion.selectedAvailableChallengeQuestion disabled><option model.bind=null value=\"\" t=challenge-question_option-default></option><option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=availableChallengeQuestion>${availableChallengeQuestion.challengeQuestionText}</option></select></div><div class=form-row><label for=\"challenge-question-answer-input-${$index}\" t=challenge-question-answer_label></label><input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=[placeholder]challenge-question-answer_placeholder></div><div class=form-row><input type=checkbox checked.bind=challengeQuestion.showActualAnswer id=\"show-actual-answer-input-${$index}\"><label for=\"show-actual-answer-input-${$index}\" t=show-actual-answer_label></label></div></div></fieldset></form></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-4 columns\"><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/challenge-with-email-info/challenge-with-email-info.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]challenge-questions_icon></i><span t=challenge-with-challenge-questions_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]challenge-with-challenge-questions_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset u-gutt-3\"><div class=u-gutt-3 repeat.for=\"emailInfo of vm.user.emailInfos\"><div class=form-row><label for=\"challenge-with-${emailInfo.label}-input\">${emailInfo.label}</label><input type=radio id=\"challenge-with-${emailInfo.label}-input\" model.bind=emailInfo checked.bind=\"vm.selectedEmailAddress & validate\"></div></div></fieldset></form></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-4 columns\"><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/challenge-with-phone-info/challenge-with-phone-info.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]challenge-questions_icon></i><span t=challenge-with-phone-infos_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]challenge-with-phone-infos_message></div></div><div class=row><div class=\"small-12 medium-8 columns end\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset login-fieldset\"><div repeat.for=\"smsInfo of vm.user.smsInfos\" class=form-row><label for=\"challenge-with-${smsInfo.label}-input\">${smsInfo.label}</label><input type=radio id=\"challenge-with-${smsInfo.label}-input\" model.bind=smsInfo checked.bind=\"vm.selectedSmsInfo & validate\"></div></fieldset></form></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-4 columns\"><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/challenge-with-rsa-token/challenge-with-rsa-token.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]challenge-questions_icon></i><span t=challenge-with-challenge-questions_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]challenge-with-challenge-questions_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=fieldset><validation-summary errors.bind=errors autofocus.bind=\"controller.validateTrigger === 'manual'\"></validation-summary><div class=u-gutt-3 repeat.for=\"challengeQuestion of vm.user.challengeQuestions\"><div class=form-row><label for=\"challenge-question-input-${$index}\" t=challenge-question_label></label><select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=challengeQuestion.selectedAvailableChallengeQuestion><option model.bind=null value=\"\" t=challenge-question_option-default></option><option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=availableChallengeQuestion>${availableChallengeQuestion.challengeQuestionText}</option></select></div><div class=form-row><label for=\"challenge-question-answer-input-${$index}\" t=challenge-question-answer_label></label><input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=[placeholder]challenge-question-answer_placeholder></div><div class=form-row><input type=checkbox checked.bind=challengeQuestion.showActualAnswer id=\"show-actual-answer-input-${$index}\"><label for=\"show-actual-answer-input-${$index}\" t=show-actual-answer_label></label></div></div></fieldset></form></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-4 columns\"><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/change-password/change-password.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]service_icon></i><span t=change-password_header></span></h3><h2><span t=signed-in-as_label t-params.bind=vm.user></span></h2></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]change-password_message></div></div></template>"; });
define('text!components/views/confirm-dialog/confirm-dialog.html', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h4><i t=\"[class]${vm.headerIcon}\"></i><span t=\"${vm.headerText}\">${vm.headerText}</span></h4></ux-dialog-header><ux-dialog-body><div t=\"[html]${vm.message}\" t-params.bind=vm.messageParams>${vm.message}</div></ux-dialog-body><ux-dialog-footer><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=\"${vm.cancelButtonText}\">${vm.cancelButtonText}</span></button><button type=button class=button click.trigger=confirm($event)><span t=\"${vm.confirmButtonText}\">${vm.confirmButtonText}</span></button></ux-dialog-footer></ux-dialog></template>"; });
define('text!components/views/edit-credentials/edit-credentials.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 columns\"><div class=\"button-group expanded\"><button class=button click.trigger=goToEnrollChallengeQuestionAnswers($event)><span t=go-to-enroll-challenge-question-answers_button></span></button><button class=button click.trigger=goToEnrollPhoneInfos($event)><span t=go-to-enroll-phone-infos_button></span></button><button class=button click.trigger=goToEnrollEmailInfos($event)><span t=go-to-enroll-email-infos_button></span></button></div></div></div><compose view-model=\"${editCredentialsViewModel}\" model.bind=vm></compose></template>"; });
define('text!components/views/enroll-email-infos/enroll-email-infos.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]email-infos_icon></i><span t=enroll-email-infos_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]enroll-email-infos_message></div></div><div repeat.for=\"emailInfo of vm.user.emailInfos\" class=row><div class=\"small-12 medium-8 columns end\"><span>${emailInfo.emailAddress}</span><i t=[class]complete_icon></i><button type=button class=\"button hollow alert\" click.trigger=\"removeEmailInfo($event, emailInfo)\"><span t=delete_button></span></button></div></div><div if.bind=vm.showAddEmailInfoForm class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset add-contact-info-fieldset\"><div class=form-row><label for=email-address-input t=email-address_label></label><input id=email-address-input type=text value.bind=\"vm.emailAddress & validate\" focus.bind=vm.emailAddressHasFocus t=[placeholder]email-address_placeholder></div><div class=form-row><button class=button click.trigger=addEmailInfo($event)><span t=add_button></span></button></div></fieldset></form></div></div><div if.bind=!vm.showAddEmailInfoForm class=row><div class=\"small-12 columns\"><button type=button class=link click.delegate=showAddEmailInfoForm($event)><i t=[class]add_icon></i><span t=show-add-email-info_button></span></button></div></div></template>"; });
define('text!components/views/enroll-phone-infos/enroll-phone-infos.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]phone-infos_icon></i><span t=enroll-phone-infos_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]enroll-phone-infos_message></div></div><div repeat.for=\"smsInfo of vm.user.smsInfos\" class=row><div class=\"small-12 medium-8 columns end\"><span>${smsInfo.phoneNumber | phoneFormatter}</span><i t=[class]complete_icon></i><button type=button class=\"button hollow alert\" click.trigger=\"removePhoneInfo($event, smsInfo)\"><span t=delete_button></span></button></div></div><div if.bind=vm.showAddPhoneInfoForm class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset add-contact-info-fieldset\"><div class=form-row><label for=phone-number-input t=phone-number_label></label><input id=phone-number-input type=text value.bind=\"vm.phoneNumber | phoneFormatter & validate\" focus.bind=vm.phoneNumberHasFocus t=[placeholder]phone-number_placeholder maxlength=16></div><div class=form-row><button class=button click.trigger=addPhoneInfo($event)><span t=add_button></span></button></div></fieldset></form></div></div><div if.bind=!vm.showAddPhoneInfoForm class=row><div class=\"small-12 columns\"><button type=button class=link click.delegate=showAddPhoneInfoForm($event)><i t=[class]add_icon></i><span t=show-add-phone-info_button></span></button></div></div></template>"; });
define('text!components/views/enrollment/enroll-credentials.html', ['module'], function(module) { module.exports = "<template><compose view-model=\"${enrollCredentialsViewModel}\" model.bind=vm></compose><div class=\"row c-action-bar\"><div class=\"small-12 medium-8 columns\"><strong t=enrollment-step_header></strong></div><div class=\"small-12 medium-4 columns\"><button type=button class=button click.trigger=skip($event) if.bind=!enrollCredentialsComplete><span t=skip_button></span></button></div><div class=\"small-12 medium-4 columns\"><button type=button class=button click.trigger=next($event) if.bind=enrollCredentialsComplete><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/enrollment/enrollment-disclaimer.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><span t=enrollment-disclaimer_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\"><div t=[html]enrollment-disclaimer_message></div></div></div><div class=row><div class=\"small-12 medium-8 columns end\"><div class=\"callout warning\"><h4><i t=[class]incomplete_icon></i><span t=enrollment-incomplete_header></span></h4><span t=[html]enrollment-incomplete_message></span></div></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-10 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset disclaimer-fieldset\"><div class=form-row><input id=confirm-disclaimer-input type=checkbox value.bind=\"vm.confirmDisclaimerChecked & validate\" checked.bind=vm.confirmDisclaimerChecked><label for=confirm-disclaimer-input t=confirm-disclaimer_label></label></div></fieldset></form></div><div class=\"small-12 medium-2 columns\"><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/enrollment/enrollment-intro.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><span t=enrollment-intro_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]enrollment-intro_message></div></div><div class=\"row c-action-bar\"><div class=\"small-12 columns\"><button type=button class=button click.trigger=start($event)><span t=start_button></span></button></div></div></template>"; });
define('text!components/views/enrollment/enrollment-review.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><span t=enrollment-review_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]enrollment-review_message></div></div><div class=row if.bind=vm.enrollmentComplete><div class=\"small-12 medium-8 columns end\"><div class=\"callout success\"><h4><i t=[class]complete_icon></i><span t=enrollment-complete_header></span></h4><span t=enrollment-complete_message></span></div></div></div><div class=row if.bind=!vm.enrollmentComplete><div class=\"small-12 medium-8 columns end\"><div class=\"callout warning\"><h4><i t=[class]incomplete_icon></i><span t=enrollment-incomplete_header></span></h4><div t=[html]enrollment-incomplete_message></div></div></div></div><div class=\"row c-action-bar\"><div class=\"small-12 columns\"><button type=button class=button click.trigger=done($event)><span t=done_button></span></button></div></div></template>"; });
define('text!components/views/enrollment/enrollment.html', ['module'], function(module) { module.exports = "<template><compose view-model=\"${enrollmentViewModel}\" model.bind=vm></compose></template>"; });
define('text!components/views/enroll-challenge-question-answers/enroll-challenge-question-answers.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]challenge-questions_icon></i><span t=enroll-challenge-question-answers_header></span></h3></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]enroll-challenge-question-answers_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=fieldset><validation-summary errors.bind=errors autofocus.bind=\"controller.validateTrigger === 'manual'\"></validation-summary><div class=u-gutt-3 repeat.for=\"challengeQuestion of vm.user.challengeQuestions\"><div class=form-row><label for=\"challenge-question-input-${$index}\" t=challenge-question_label></label><select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=challengeQuestion.selectedAvailableChallengeQuestion><option model.bind=null value=\"\" t=challenge-question_option-default></option><option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=availableChallengeQuestion>${availableChallengeQuestion.challengeQuestionText}</option></select></div><div class=form-row><label for=\"challenge-question-answer-input-${$index}\" t=challenge-question-answer_label></label><input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=[placeholder]challenge-question-answer_placeholder></div><div class=form-row><input type=checkbox checked.bind=challengeQuestion.showActualAnswer id=\"show-actual-answer-input-${$index}\"><label for=\"show-actual-answer-input-${$index}\" t=show-actual-answer_label></label></div></div><div class=form-row><button type=button class=\"button expanded radius\" click.trigger=save($event)><span t=save_button></span></button></div></fieldset></form></div></div></template>"; });
define('text!components/views/login/challenge-with-credentials.html', ['module'], function(module) { module.exports = "<template><compose view-model=\"${challengeWithCredentialsViewModel}\" model.bind=vm></compose></template>"; });
define('text!components/views/login/challenge.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]security_icon></i><span t=challenge_header></span></h3></div></div><div class=row><div class=\"small-12 columns end\" t=[html]challenge_message></div></div><div class=row><div class=\"small-12 medium-8 columns end\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset u-gutt-3\"><div class=u-gutt-3 repeat.for=\"credentialType of vm.user.availableChallengeCredentialTypes\"><div class=form-row><label for=\"challenge-with-${credentialType}-input\" t=\"challenge-with-${credentialType}_label\"></label><input type=radio id=\"challenge-with-${credentialType}-input\" model.bind=credentialType checked.bind=\"vm.selectedCredentialType & validate\"></div></div></fieldset><fieldset class=fieldset><legend t=bind-device_header></legend><div class=u-gutt-3 repeat.for=\"option of vm.bindDeviceOptions\"><div class=form-row><label for=\"bind-device-${option}-input\" t=\"bind-device-${option}_label\"></label><input id=\"bind-device-${option}-input\" type=radio model.bind=option checked.bind=vm.bindDevice></div></div></fieldset></form></div></div><div class=\"row c-action-bar\"><div class=\"small-12 medium-8 columns end\"><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button type=button class=button click.trigger=next($event)><span t=next_button></span></button></div></div></template>"; });
define('text!components/views/login/deny.html', ['module'], function(module) { module.exports = "<template></template>"; });
define('text!components/views/login/login.html', ['module'], function(module) { module.exports = "<template><compose view-model=\"${loginViewModel}\" model.bind=vm></compose></template>"; });
define('text!components/views/login/network-credentials.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=\"fieldset login-fieldset\"><validation-summary errors.bind=errors autofocus.bind=\"controller.validateTrigger === 'manual'\"></validation-summary><div class=form-row><label for=user-id-input t=user-id_label></label><input id=user-id-input type=text value.bind=\"vm.user.userId & validate\" focus.bind=vm.userIdHasFocus t=[placeholder]user-id_placeholder></div><div class=form-row><label for=credentials-input t=credentials_label></label><input id=credentials-input type=password value.bind=\"vm.user.credentials & validate\" focus.bind=vm.credentialsHasFocus keypressinput.bind=keypressInput($event) t=[placeholder]credentials_placeholder></div><div class=form-row><button type=button class=\"button expanded radius\" click.trigger=signin($event)><span t=signin_button></span></button></div><div class=form-row><button type=button class=\"button expanded hollow\" click.trigger=goToForgotPassword($event)><span t=go-to-forgot-password_button></span></button></div></fieldset></form></div></div><div class=row><div class=\"small-12 columns\"><span class=\"text-center disclaimer\" t=disclaimer_message></span></div></div></template>"; });
define('text!components/views/logout/logout.html', ['module'], function(module) { module.exports = "<template></template>"; });
define('text!components/views/self-service/self-service.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]service_icon></i><span t=self-service_header></span></h3><h2><span t=signed-in-as_label></span><span>${vm.user.userId}</span></h2></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]self-service_message></div></div><div class=row><div class=\"small-12 columns\"><div class=\"button-group expanded\"><button class=\"button button--full\" click.trigger=goToChangePassword($event)><span class=\"u-dis-b text-center\"><i t=[class]change-password_icon></i></span><span class=\"u-lh-lg text-center\"><span t=go-to-change-password_button></span></span></button><button class=\"button button--full\" click.trigger=goToEditProfile($event)><span class=\"u-dis-b text-center\"><i t=[class]profile_icon></i></span><span class=\"u-lh-lg text-center\"><span t=go-to-edit-profile_button></span></span></button><button class=\"button button--full\" click.trigger=goToUnlockAccount($event)><span class=\"u-dis-b text-center\"><i t=[class]unlock_icon></i></span><span class=\"u-lh-lg text-center\"><span t=go-to-unlock-account_button></span></span></button></div></div></div></template>"; });
define('text!components/views/unlock-account/unlock-account.html', ['module'], function(module) { module.exports = "<template><div class=row><div class=\"small-12 medium-8 columns end\"><h3><i t=[class]service_icon></i><span t=unlock-account_header></span></h3><h2><span t=signed-in-as_label t-params.bind=vm.user></span></h2></div></div><div class=row><div class=\"small-12 medium-8 columns end\" t=[html]unlock-account_message></div></div></template>"; });
define('text!components/views/verify-phone-info-dialog/verify-phone-info-dialog.html', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h3><i t=[class]verify-phone-info_icon></i><span t=verify-phone-info_header></span></h3></ux-dialog-header><ux-dialog-body><div class=row><div class=\"small-12 columns\" t=[html]verify-phone-info_message t-params.bind=vm.messageParams></div></div><div if.bind=!vm.eventTimerExpired class=row><div class=\"small-12 columns\"><span t=remaining-time_label></span><span>${vm.remainingTime | timerFormatter}</span></div></div><div if.bind=vm.eventTimerExpired class=row><div class=\"small-12 columns\" t=[html]verification-code-expired_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=fieldset><div class=form-row><label for=verification-code-input t=verification-code_label></label><input id=verification-code-input type=text autocomplete=off value.bind=\"vm.verificationCode & validate\" attach-focus.bind=vm.verificationCodeHasFocus t=[placeholder]verification-code_placeholder></div></fieldset></form></div></div></ux-dialog-body><ux-dialog-footer><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button if.bind=vm.eventTimerExpired type=button class=\"hollow button\" click.trigger=resend($event)><span t=resend-code_button></span></button><button if.bind=!vm.eventTimerExpired type=button class=\"hollow button\" click.trigger=verify($event)><span t=verify_button></span></button></ux-dialog-footer></ux-dialog></template>"; });
define('text!components/views/verify-email-info-dialog/verify-email-info-dialog.html', ['module'], function(module) { module.exports = "<template><ux-dialog><ux-dialog-header><h3><i t=[class]verify-email-info_icon></i><span t=verify-email-info_header></span></h3></ux-dialog-header><ux-dialog-body><div class=row><div class=\"small-12 columns\" t=[html]verify-email-info_message t-params.bind=vm.messageParams></div></div><div if.bind=!vm.eventTimerExpired class=row><div class=\"small-12 columns\"><span t=remaining-time_label></span><span>${vm.remainingTime | timerFormatter}</span></div></div><div if.bind=vm.eventTimerExpired class=row><div class=\"small-12 columns\" t=[html]verification-code-expired_message></div></div><div class=row><div class=\"small-12 columns\"><form validation-renderer=foundation-form validation-errors.bind=errors><fieldset class=fieldset><div class=form-row><label for=verification-code-input t=verification-code_label></label><input id=verification-code-input type=text autocomplete=off value.bind=\"vm.verificationCode & validate\" attach-focus.bind=vm.verificationCodeHasFocus t=[placeholder]verification-code_placeholder></div></fieldset></form></div></div></ux-dialog-body><ux-dialog-footer><button type=button class=\"hollow button\" click.trigger=cancel($event)><span t=cancel_button></span></button><button if.bind=vm.eventTimerExpired type=button class=\"hollow button\" click.trigger=resend($event)><span t=resend-code_button></span></button><button if.bind=!vm.eventTimerExpired type=button class=\"hollow button\" click.trigger=verify($event)><span t=verify_button></span></button></ux-dialog-footer></ux-dialog></template>"; });
//# sourceMappingURL=app-bundle.js.map