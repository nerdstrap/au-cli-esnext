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
define('main',['exports', 'config/router', 'config/app', 'config/auth', 'config/local', 'i18next-xhr-backend', 'aurelia-config', 'aurelia-router', 'aurelia-authentication', 'aurelia-validation', 'aurelia-framework', 'aurelia-logging-console'], function (exports, _router, _app, _auth, _local, _i18nextXhrBackend, _aureliaConfig, _aureliaRouter, _aureliaAuthentication, _aureliaValidation, _aureliaFramework, _aureliaLoggingConsole) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.configure = configure;

    var _router2 = _interopRequireDefault(_router);

    var _app2 = _interopRequireDefault(_app);

    var _auth2 = _interopRequireDefault(_auth);

    var _local2 = _interopRequireDefault(_local);

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
        aurelia.use.standardConfiguration().feature('foundation-validation').feature('resources').feature('components').plugin('aurelia-validation').plugin('aurelia-config', function (configure) {
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
                attributes: ['t'],
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
define('app/app',['exports', 'aurelia-framework', 'aurelia-router', 'aurelia-authentication', 'aurelia-notification', 'aurelia-i18n', 'util/logger-helper', 'jquery', 'foundation-sites'], function (exports, _aureliaFramework, _aureliaRouter, _aureliaAuthentication, _aureliaNotification, _aureliaI18n, _loggerHelper, _jquery, _foundationSites) {
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

    var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_aureliaRouter.Router, _aureliaAuthentication.AuthService, _aureliaNotification.Notification, _aureliaI18n.I18N), _dec(_class = function () {
        function App(router, authService, notification, i18n) {
            _classCallCheck(this, App);

            this.languages = [{ code: 'en', locale: 'en-US', flag: 'us' }];

            this.router = router;
            this.authService = authService;
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
            (0, _jquery2.default)(document).foundation();
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
            title: 'Corporation Name\'s Self Service Password Reset',
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
define('foundation-validation/foundation-validation-renderer',['exports', 'aurelia-validation'], function (exports, _aureliaValidation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.FoundationValidationRenderer = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    if (window.Element && !Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s);
            var i = void 0;
            var el = this;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) {}
            } while (i < 0 && (el = el.parentElement));
            return el;
        };
    }

    var abideLabels = false;

    var FoundationValidationRenderer = exports.FoundationValidationRenderer = function () {
        function FoundationValidationRenderer() {
            _classCallCheck(this, FoundationValidationRenderer);
        }

        FoundationValidationRenderer.prototype.render = function render(instruction) {
            for (var _iterator = instruction.unrender, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref2;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref2 = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref2 = _i.value;
                }

                var _ref5 = _ref2;
                var result = _ref5.result,
                    elements = _ref5.elements;

                for (var _iterator3 = elements, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                    var _ref6;

                    if (_isArray3) {
                        if (_i3 >= _iterator3.length) break;
                        _ref6 = _iterator3[_i3++];
                    } else {
                        _i3 = _iterator3.next();
                        if (_i3.done) break;
                        _ref6 = _i3.value;
                    }

                    var element = _ref6;

                    FoundationValidationRenderer.remove(element, result);
                }
            }

            for (var _iterator2 = instruction.render, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                var _ref4;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref4 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref4 = _i2.value;
                }

                var _ref7 = _ref4;
                var result = _ref7.result,
                    elements = _ref7.elements;

                if (!result.valid) {
                    for (var _iterator4 = elements, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                        var _ref8;

                        if (_isArray4) {
                            if (_i4 >= _iterator4.length) break;
                            _ref8 = _iterator4[_i4++];
                        } else {
                            _i4 = _iterator4.next();
                            if (_i4.done) break;
                            _ref8 = _i4.value;
                        }

                        var _element = _ref8;

                        FoundationValidationRenderer.add(_element, result);
                    }
                }
            }
        };

        FoundationValidationRenderer.add = function add(element, result) {
            if (element) {
                var formRow = element.closest('.form-row');
                if (!formRow) {
                    return;
                }

                var formLabel = formRow.getElementsByTagName('label')[0];
                var formInput = formRow.getElementsByTagName('input')[0];
                if (result.valid) {
                    if (abideLabels && formLabel && !formLabel.classList.contains('is-invalid-label')) {
                        formLabel.classList.add('is-valid-label');
                    }

                    if (formInput && !formInput.classList.contains('is-invalid-input')) {
                        formInput.classList.add('is-valid-input');
                    }
                } else {
                    if (abideLabels && formLabel) {
                        formLabel.classList.remove('is-valid-label');
                        formLabel.classList.add('is-invalid-label');
                    }

                    if (formInput) {
                        formInput.classList.remove('is-valid-input');
                        formInput.classList.add('is-invalid-input');
                        formInput.setAttribute('aria-invalid', 'true');
                    }

                    var message = document.createElement('span');
                    message.className = 'form-error is-visible';
                    message.textContent = result.message;
                    message.id = 'validation-message-' + result.id;
                    formRow.appendChild(message);
                }
            }
        };

        FoundationValidationRenderer.remove = function remove(element, result) {
            if (element) {
                var formRow = element.closest('.form-row');
                if (!formRow) {
                    return;
                }

                var formLabel = formRow.getElementsByTagName('label')[0];
                var formInput = formRow.getElementsByTagName('input')[0];

                if (result.valid) {
                    if (abideLabels && formLabel) {
                        formLabel.classList.remove('is-valid-label');
                    }

                    if (formInput) {
                        formInput.classList.remove('is-valid-input');
                    }
                } else {
                    if (abideLabels && formLabel) {
                        formLabel.classList.remove('is-invalid-label');
                    }

                    if (formInput) {
                        formInput.classList.remove('is-invalid-input');
                        formInput.setAttribute('aria-invalid', 'false');
                    }

                    var message = formRow.querySelector('#validation-message-' + result.id);
                    if (message) {
                        formRow.removeChild(message);
                    }
                }
            }
        };

        return FoundationValidationRenderer;
    }();
});
define('foundation-validation/index',['exports', 'foundation-validation/foundation-validation-renderer'], function (exports, _foundationValidationRenderer) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.configure = configure;
    function configure(config) {
        config.container.registerHandler('foundation-form', function (container) {
            return container.get(_foundationValidationRenderer.FoundationValidationRenderer);
        });
    }
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
define('services/user-service',['exports', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-notification', 'aurelia-router', 'nprogress', 'aurelia-api', 'aurelia-authentication', 'util/logger-helper', 'util/device-helper'], function (exports, _aureliaFramework, _aureliaFetchClient, _aureliaNotification, _aureliaRouter, _nprogress, _aureliaApi, _aureliaAuthentication, _loggerHelper, _deviceHelper) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UserService = undefined;

    var nprogress = _interopRequireWildcard(_nprogress);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

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
            nprogress.start();
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
            nprogress.done();
        };

        return UserService;
    }()) || _class);
});
define('util/common-models',['exports', 'lodash'], function (exports, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.EnumeratedTypeHelper = exports.UserType = exports.UserStatus = exports.ContactType = exports.CredentialType = exports.ActionCode = exports.AuthStatusCode = exports.Enum = exports.EnumSymbol = undefined;

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

    var _class, _temp, _initialiseProps;

    var EnumSymbol = exports.EnumSymbol = (_temp = _class = function () {
        function EnumSymbol(name, _ref) {
            var ordinal = _ref.ordinal,
                description = _ref.description;

            _classCallCheck(this, EnumSymbol);

            _initialiseProps.call(this);

            if (!Object.is) {
                Object.is = function (x, y) {
                    if (x === y) {
                        return x !== 0 || 1 / x === 1 / y;
                    } else {
                        return x !== x && y !== y;
                    }
                };
            }
            if (!Object.is(ordinal, undefined)) {
                this.ordinal = ordinal;
            }
            if (description) {
                this.description = description;
            }
            this.keyName = name;
            Object.freeze(this);
        }

        EnumSymbol.prototype.toString = function toString() {
            return this.sym;
        };

        EnumSymbol.prototype.valueOf = function valueOf() {
            return this.ordinal;
        };

        _createClass(EnumSymbol, [{
            key: 'display',
            get: function get() {
                return this.description || Symbol.keyFor(this.sym);
            }
        }, {
            key: 'key',
            get: function get() {
                return this.keyName;
            }
        }]);

        return EnumSymbol;
    }(), _initialiseProps = function _initialiseProps() {
        this.sym = Symbol.for(name);
    }, _temp);

    var Enum = exports.Enum = function () {
        function Enum(enumLiterals) {
            _classCallCheck(this, Enum);

            for (var key in enumLiterals) {
                if (enumLiterals.hasOwnProperty(key)) {
                    if (!enumLiterals[key]) {
                        throw new TypeError('each enum should have been initialized with at least empty {} value');
                    }
                    this[key] = new EnumSymbol(key, enumLiterals[key]);
                }
            }
            Object.freeze(this);
        }

        Enum.prototype.symbols = function symbols() {
            var syms = [];
            var self = this;
            Object.keys(this).forEach(function (k) {
                syms.push(self[k]);
            });
            return syms;
        };

        Enum.prototype.keys = function keys() {
            return Object.keys(this);
        };

        Enum.prototype.contains = function contains(sym) {
            if (!(sym instanceof EnumSymbol)) {
                return false;
            }
            return this[Symbol.keyFor(sym.sym)] === sym;
        };

        Enum.prototype.get = function get(ordinal) {
            var self = this;
            var symbol = void 0;
            this.keys().forEach(function (k) {
                if (self[k].ordinal === +ordinal) {
                    symbol = self[k];
                }
            });
            return symbol;
        };

        return Enum;
    }();

    var AuthStatusCode = exports.AuthStatusCode = new Enum({
        Success: { ordinal: 0, description: 'authStatusCode.success' },
        Deny: { ordinal: 1, description: 'authStatusCode.deny' },
        Pending: { ordinal: 2, description: 'authStatusCode.pending' },
        Challenge: { ordinal: 3, description: 'authStatusCode.challenge' }
    });

    var ActionCode = exports.ActionCode = new Enum({
        ALLOW: { ordinal: 0, description: 'actionCode.allow' },
        DENY: { ordinal: 1, description: 'actionCode.deny' },
        CHALLENGE: { ordinal: 2, description: 'actionCode.challenge' },
        ENROLL: { ordinal: 3, description: 'actionCode.enroll' }
    });

    var CredentialType = exports.CredentialType = new Enum({
        PASSWORD: { ordinal: 0, description: 'credentialType.password' },
        QUESTIONS: { ordinal: 1, description: 'credentialType.questions' },
        PHONE: { ordinal: 2, description: 'credentialType.phone' },
        EMAIL: { ordinal: 3, description: 'credentialType.email' },
        RSATOKEN: { ordinal: 4, description: 'credentialType.rsaToken' }
    });

    var ContactType = exports.ContactType = new Enum({
        PHONE: { ordinal: 0, description: 'contactType.phone' },
        EMAIL: { ordinal: 1, description: 'contactType.email' }
    });

    var UserStatus = exports.UserStatus = new Enum({
        NOTENROLLED: { ordinal: 0, description: 'actionCode.notEnrolled' },
        UNVERIFIED: { ordinal: 1, description: 'actionCode.unverified' },
        VERIFIED: { ordinal: 2, description: 'actionCode.verified' },
        DELETE: { ordinal: 3, description: 'actionCode.delete' },
        LOCKOUT: { ordinal: 4, description: 'actionCode.lockout' },
        UNLOCKOUT: { ordinal: 5, description: 'actionCode.unlockout' }
    });

    var UserType = exports.UserType = new Enum({
        PERSISTENT: { ordinal: 0, description: 'actionCode.persistent' },
        NONPERSISTENT: { ordinal: 1, description: 'actionCode.nonPersistent' },
        BAIT: { ordinal: 2, description: 'actionCode.bait' }
    });

    var determineShiftedValues = function determineShiftedValues(total, highestValue) {
        var values = [];
        var runningTotal = total;
        for (var i = highestValue; i >= 0; i--) {
            if (runningTotal >> i === 1) {
                var binValue = Math.pow(2, i);
                runningTotal = runningTotal - binValue;
                values.push(binValue);
            }
        }
        return values;
    };

    var EnumeratedTypeHelper = exports.EnumeratedTypeHelper = function () {
        return {
            asArray: function asArray(type, value) {
                if (value === undefined) {
                    return [];
                }
                var v = determineShiftedValues(value, type.symbols().length);
                var enums = [];
                _lodash2.default.forEach(v, function (ordinal) {
                    enums.push(type.get(ordinal));
                });
                return enums;
            }
        };
    }();
});
define('util/device-helper',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

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

    var DeviceHelper = exports.DeviceHelper = function () {
        function DeviceHelper() {
            _classCallCheck(this, DeviceHelper);
        }

        DeviceHelper.prototype.setDeviceTokenCookie = function setDeviceTokenCookie(cDeviceToken) {
            var cname = "PMData";
            var cmaxage = 365;
            var d = new Date();
            d.setTime(d.getTime() + cmaxage * 24 * 60 * 60 * 1000);
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cDeviceToken + ";" + expires + ";path=/;";
        };

        _createClass(DeviceHelper, [{
            key: "deviceRequest",
            get: function get() {
                var devicePrint = encode_deviceprint();

                var deviceTokenCookie = this.deviceTokenCookie;

                return {
                    "devicePrint": devicePrint,
                    "deviceTokenCookie": deviceTokenCookie,
                    "deviceTokenFSO": deviceTokenCookie,
                    "httpAccept": null,
                    "httpAcceptChars": null,
                    "httpAcceptEncoding": null,
                    "httpAcceptLanguage": null,
                    "httpReferrer": null,
                    "ipAddress": null,
                    "userAgent": null
                };
            }
        }, {
            key: "deviceTokenCookie",
            get: function get() {
                var cname = "PMData=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(cname) === 0) {
                        return c.substring(cname.length, c.length);
                    }
                }
                return "";
            }
        }]);

        return DeviceHelper;
    }();
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
define('util/object-utilities',['exports', 'odata-filter-parser', 'lodash'], function (exports, _odataFilterParser, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.StringUtil = exports.PredicateUtilities = exports.ObjectUtilities = undefined;

    var _odataFilterParser2 = _interopRequireDefault(_odataFilterParser);

    var _lodash2 = _interopRequireDefault(_lodash);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var Operators = _odataFilterParser2.default.Operators;

    var ObjectUtilities = exports.ObjectUtilities = {
        isEqual: function isEqual(objA, objB) {
            if (!objA || !objB) {
                return !objA && !objB;
            }
            var aKeys = Object.keys(objA);
            var bKeys = Object.keys(objB);
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            for (var i = 0, len = aKeys.length; i < len; i++) {
                var key = aKeys[i];
                if (!objB.hasOwnProperty(key) || objA[key] !== objB[key]) {
                    return false;
                }
            }
            return true;
        },

        deepExtend: function deepExtend(destination, source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    if (source[property] && source[property].constructor && source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        ObjectUtilities.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
            }
            return destination;
        }
    };

    var PredicateUtilities = exports.PredicateUtilities = {
        removeMatches: function removeMatches(subject, predicates) {
            var predicateList = _lodash2.default.clone(predicates);
            if (predicateList.length === 1 && !Operators.isLogical(predicateList[0].operator)) {
                if (predicateList[0].subject === subject) {
                    predicateList.splice(0, 1);
                }
            } else {
                _lodash2.default.remove(predicateList, function (item) {
                    return item.subject === subject;
                });
                var logicals = _lodash2.default.filter(predicateList, function (item) {
                    return Operators.isLogical(item.operator);
                });
                if (logicals.length > 0) {
                    _lodash2.default.forEach(logicals, function (logical) {
                        var flattened = logical.flatten();
                        var processed = PredicateUtilities.removeMatches(subject, flattened);
                        if (processed.length < flattened.length) {
                            var indx = _lodash2.default.indexOf(predicateList, logical);
                            predicateList.splice(indx, 1);
                        }
                    });
                }
            }
            return predicateList;
        }
    };

    var StringUtil = exports.StringUtil = {
        pluralize: function pluralize(str, count) {
            var s = str;
            if (count > 1) {
                if (str.endsWith("y")) {
                    s = str.substring(0, str.length - 1) + 'ies';
                } else {
                    s += 's';
                }
            }
            return s;
        }
    };
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
define('homefront/lib/expand',['require','exports','module'],function (require, exports, module) {'use strict';

/**
 * Expands flat object to nested object.
 *
 * @param {{}} source
 *
 * @return {{}}
 */
module.exports = function expand(source) {
  var destination = {};

  Object.getOwnPropertyNames(source).forEach(function (flatKey) {

    // If the key doesn't contain a dot (isn't nested), just set the value.
    if (flatKey.indexOf('.') === -1) {
      destination[flatKey] = source[flatKey];

      return;
    }

    var tmp  = destination;         // Pointer for the nested object.
    var keys = flatKey.split('.');  // Keys (path) for the nested object.
    var key  = keys.pop();          // The last (deepest) key.

    keys.forEach(function (value) {
      if (typeof tmp[value] === 'undefined') {
        tmp[value] = {};
      }

      tmp = tmp[value];
    });

    tmp[key] = source[flatKey];
  });

  return destination;
};

});

define('homefront/lib/utils',['require','exports','module'],function (require, exports, module) {'use strict';

var Utils = function Utils () {};

Utils.normalizeKey = function normalizeKey (rest) {
  rest         = Array.isArray(rest) ? rest : Array.prototype.slice.call(arguments);//eslint-disable-line prefer-rest-params
  var key      = rest.shift();
  var normalized = Array.isArray(key) ? Utils.normalizeKey(key) : key.split('.');

  return rest.length === 0 ? normalized : normalized.concat(Utils.normalizeKey(rest));
};

/**
 * Check if `target` is a Plain ol' Javascript Object.
 *
 * @param {*} target
 *
 * @return {boolean}
 */
Utils.isPojo = function isPojo (target) {
  return !(target === null || typeof target !== 'object') && target.constructor === Object;
};

module.exports = Utils;

});

define('homefront/lib/flatten',['require','exports','module','./utils'],function (require, exports, module) {'use strict';

var Utils = require('./utils');

/**
 * Flattens nested object (dot separated keys).
 *
 * @param {{}}      source
 * @param {String}  [basePath]
 * @param {{}}      [target]
 *
 * @return {{}}
 */
module.exports = function flatten(source, basePath, target) {
  basePath = basePath || '';
  target   = target || {};

  Object.getOwnPropertyNames(source).forEach(function (key) {
    if (Utils.isPojo(source[key])) {
      flatten(source[key], basePath + key + '.', target);

      return;
    }

    target[basePath + key] = source[key];
  });

  return target;
};

});

define('jwt-decode/base64_url_decode',['require','exports','module','./atob'],function (require, exports, module) {var atob = require('./atob');

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};

});

define('jwt-decode/atob',['require','exports','module'],function (require, exports, module) {/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;

});

define('aurelia-templating-resources/compose',['exports', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-templating', 'aurelia-pal'], function (exports, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaTemplating, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Compose = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
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

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var Compose = exports.Compose = (_dec = (0, _aureliaTemplating.customElement)('compose'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaDependencyInjection.Container, _aureliaTemplating.CompositionEngine, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaTaskQueue.TaskQueue), _dec(_class = (0, _aureliaTemplating.noView)(_class = _dec2(_class = (_class2 = function () {
    function Compose(element, container, compositionEngine, viewSlot, viewResources, taskQueue) {
      

      _initDefineProp(this, 'model', _descriptor, this);

      _initDefineProp(this, 'view', _descriptor2, this);

      _initDefineProp(this, 'viewModel', _descriptor3, this);

      _initDefineProp(this, 'swapOrder', _descriptor4, this);

      this.element = element;
      this.container = container;
      this.compositionEngine = compositionEngine;
      this.viewSlot = viewSlot;
      this.viewResources = viewResources;
      this.taskQueue = taskQueue;
      this.currentController = null;
      this.currentViewModel = null;
    }

    Compose.prototype.created = function created(owningView) {
      this.owningView = owningView;
    };

    Compose.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      processInstruction(this, createInstruction(this, {
        view: this.view,
        viewModel: this.viewModel,
        model: this.model
      }));
    };

    Compose.prototype.unbind = function unbind(bindingContext, overrideContext) {
      this.bindingContext = null;
      this.overrideContext = null;
      var returnToCache = true;
      var skipAnimation = true;
      this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Compose.prototype.modelChanged = function modelChanged(newValue, oldValue) {
      var _this = this;

      if (this.currentInstruction) {
        this.currentInstruction.model = newValue;
        return;
      }

      this.taskQueue.queueMicroTask(function () {
        if (_this.currentInstruction) {
          _this.currentInstruction.model = newValue;
          return;
        }

        var vm = _this.currentViewModel;

        if (vm && typeof vm.activate === 'function') {
          vm.activate(newValue);
        }
      });
    };

    Compose.prototype.viewChanged = function viewChanged(newValue, oldValue) {
      var _this2 = this;

      var instruction = createInstruction(this, {
        view: newValue,
        viewModel: this.currentViewModel || this.viewModel,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this2, _this2.currentInstruction);
      });
    };

    Compose.prototype.viewModelChanged = function viewModelChanged(newValue, oldValue) {
      var _this3 = this;

      var instruction = createInstruction(this, {
        viewModel: newValue,
        view: this.view,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this3, _this3.currentInstruction);
      });
    };

    return Compose;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'model', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'view', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'viewModel', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'swapOrder', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);


  function createInstruction(composer, instruction) {
    return Object.assign(instruction, {
      bindingContext: composer.bindingContext,
      overrideContext: composer.overrideContext,
      owningView: composer.owningView,
      container: composer.container,
      viewSlot: composer.viewSlot,
      viewResources: composer.viewResources,
      currentController: composer.currentController,
      host: composer.element,
      swapOrder: composer.swapOrder
    });
  }

  function processInstruction(composer, instruction) {
    composer.currentInstruction = null;
    composer.compositionEngine.compose(instruction).then(function (controller) {
      composer.currentController = controller;
      composer.currentViewModel = controller ? controller.viewModel : null;
    });
  }
});
define('aurelia-templating-resources/if',['exports', 'aurelia-templating', 'aurelia-dependency-injection'], function (exports, _aureliaTemplating, _aureliaDependencyInjection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.If = undefined;

  

  var _dec, _dec2, _class;

  var If = exports.If = (_dec = (0, _aureliaTemplating.customAttribute)('if'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function If(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.showing = false;
      this.view = null;
      this.bindingContext = null;
      this.overrideContext = null;
    }

    If.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    If.prototype.valueChanged = function valueChanged(newValue) {
      var _this = this;

      if (this.__queuedChanges) {
        this.__queuedChanges.push(newValue);
        return;
      }

      var maybePromise = this._runValueChanged(newValue);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedChanges = _this.__queuedChanges = [];

          var runQueuedChanges = function runQueuedChanges() {
            if (!queuedChanges.length) {
              _this.__queuedChanges = undefined;
              return;
            }

            var nextPromise = _this._runValueChanged(queuedChanges.shift()) || Promise.resolve();
            nextPromise.then(runQueuedChanges);
          };

          maybePromise.then(runQueuedChanges);
        })();
      }
    };

    If.prototype._runValueChanged = function _runValueChanged(newValue) {
      var _this2 = this;

      if (!newValue) {
        var viewOrPromise = void 0;
        if (this.view !== null && this.showing) {
          viewOrPromise = this.viewSlot.remove(this.view);
          if (viewOrPromise instanceof Promise) {
            viewOrPromise.then(function () {
              return _this2.view.unbind();
            });
          } else {
            this.view.unbind();
          }
        }

        this.showing = false;
        return viewOrPromise;
      }

      if (this.view === null) {
        this.view = this.viewFactory.create();
      }

      if (!this.view.isBound) {
        this.view.bind(this.bindingContext, this.overrideContext);
      }

      if (!this.showing) {
        this.showing = true;
        return this.viewSlot.add(this.view);
      }

      return undefined;
    };

    If.prototype.unbind = function unbind() {
      if (this.view === null) {
        return;
      }

      this.view.unbind();

      if (!this.viewFactory.isCaching) {
        return;
      }

      if (this.showing) {
        this.showing = false;
        this.viewSlot.remove(this.view, true, true);
      }
      this.view.returnToCache();
      this.view = null;
    };

    return If;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/with',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-binding'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.With = undefined;

  

  var _dec, _dec2, _class;

  var With = exports.With = (_dec = (0, _aureliaTemplating.customAttribute)('with'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function With(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.parentOverrideContext = null;
      this.view = null;
    }

    With.prototype.bind = function bind(bindingContext, overrideContext) {
      this.parentOverrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    With.prototype.valueChanged = function valueChanged(newValue) {
      var overrideContext = (0, _aureliaBinding.createOverrideContext)(newValue, this.parentOverrideContext);
      if (!this.view) {
        this.view = this.viewFactory.create();
        this.view.bind(newValue, overrideContext);
        this.viewSlot.add(this.view);
      } else {
        this.view.bind(newValue, overrideContext);
      }
    };

    With.prototype.unbind = function unbind() {
      this.parentOverrideContext = null;

      if (this.view) {
        this.view.unbind();
      }
    };

    return With;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat',['exports', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-templating', './repeat-strategy-locator', './repeat-utilities', './analyze-view-factory', './abstract-repeater'], function (exports, _aureliaDependencyInjection, _aureliaBinding, _aureliaTemplating, _repeatStrategyLocator, _repeatUtilities, _analyzeViewFactory, _abstractRepeater) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Repeat = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
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

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var Repeat = exports.Repeat = (_dec = (0, _aureliaTemplating.customAttribute)('repeat'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.TargetInstruction, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaBinding.ObserverLocator, _repeatStrategyLocator.RepeatStrategyLocator), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = (_class2 = function (_AbstractRepeater) {
    _inherits(Repeat, _AbstractRepeater);

    function Repeat(viewFactory, instruction, viewSlot, viewResources, observerLocator, strategyLocator) {
      

      var _this = _possibleConstructorReturn(this, _AbstractRepeater.call(this, {
        local: 'item',
        viewsRequireLifecycle: (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory)
      }));

      _initDefineProp(_this, 'items', _descriptor, _this);

      _initDefineProp(_this, 'local', _descriptor2, _this);

      _initDefineProp(_this, 'key', _descriptor3, _this);

      _initDefineProp(_this, 'value', _descriptor4, _this);

      _this.viewFactory = viewFactory;
      _this.instruction = instruction;
      _this.viewSlot = viewSlot;
      _this.lookupFunctions = viewResources.lookupFunctions;
      _this.observerLocator = observerLocator;
      _this.key = 'key';
      _this.value = 'value';
      _this.strategyLocator = strategyLocator;
      _this.ignoreMutation = false;
      _this.sourceExpression = (0, _repeatUtilities.getItemsSourceExpression)(_this.instruction, 'repeat.for');
      _this.isOneTime = (0, _repeatUtilities.isOneTime)(_this.sourceExpression);
      _this.viewsRequireLifecycle = (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory);
      return _this;
    }

    Repeat.prototype.call = function call(context, changes) {
      this[context](this.items, changes);
    };

    Repeat.prototype.bind = function bind(bindingContext, overrideContext) {
      this.scope = { bindingContext: bindingContext, overrideContext: overrideContext };
      this.matcherBinding = this._captureAndRemoveMatcherBinding();
      this.itemsChanged();
    };

    Repeat.prototype.unbind = function unbind() {
      this.scope = null;
      this.items = null;
      this.matcherBinding = null;
      this.viewSlot.removeAll(true);
      this._unsubscribeCollection();
    };

    Repeat.prototype._unsubscribeCollection = function _unsubscribeCollection() {
      if (this.collectionObserver) {
        this.collectionObserver.unsubscribe(this.callContext, this);
        this.collectionObserver = null;
        this.callContext = null;
      }
    };

    Repeat.prototype.itemsChanged = function itemsChanged() {
      this._unsubscribeCollection();

      if (!this.scope) {
        return;
      }

      var items = this.items;
      this.strategy = this.strategyLocator.getStrategy(items);
      if (!this.strategy) {
        throw new Error('Value for \'' + this.sourceExpression + '\' is non-repeatable');
      }

      if (!this.isOneTime && !this._observeInnerCollection()) {
        this._observeCollection();
      }
      this.strategy.instanceChanged(this, items);
    };

    Repeat.prototype._getInnerCollection = function _getInnerCollection() {
      var expression = (0, _repeatUtilities.unwrapExpression)(this.sourceExpression);
      if (!expression) {
        return null;
      }
      return expression.evaluate(this.scope, null);
    };

    Repeat.prototype.handleCollectionMutated = function handleCollectionMutated(collection, changes) {
      if (!this.collectionObserver) {
        return;
      }
      this.strategy.instanceMutated(this, collection, changes);
    };

    Repeat.prototype.handleInnerCollectionMutated = function handleInnerCollectionMutated(collection, changes) {
      var _this2 = this;

      if (!this.collectionObserver) {
        return;
      }

      if (this.ignoreMutation) {
        return;
      }
      this.ignoreMutation = true;
      var newItems = this.sourceExpression.evaluate(this.scope, this.lookupFunctions);
      this.observerLocator.taskQueue.queueMicroTask(function () {
        return _this2.ignoreMutation = false;
      });

      if (newItems === this.items) {
        this.itemsChanged();
      } else {
        this.items = newItems;
      }
    };

    Repeat.prototype._observeInnerCollection = function _observeInnerCollection() {
      var items = this._getInnerCollection();
      var strategy = this.strategyLocator.getStrategy(items);
      if (!strategy) {
        return false;
      }
      this.collectionObserver = strategy.getCollectionObserver(this.observerLocator, items);
      if (!this.collectionObserver) {
        return false;
      }
      this.callContext = 'handleInnerCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
      return true;
    };

    Repeat.prototype._observeCollection = function _observeCollection() {
      var items = this.items;
      this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, items);
      if (this.collectionObserver) {
        this.callContext = 'handleCollectionMutated';
        this.collectionObserver.subscribe(this.callContext, this);
      }
    };

    Repeat.prototype._captureAndRemoveMatcherBinding = function _captureAndRemoveMatcherBinding() {
      if (this.viewFactory.viewFactory) {
        var instructions = this.viewFactory.viewFactory.instructions;
        var instructionIds = Object.keys(instructions);
        for (var i = 0; i < instructionIds.length; i++) {
          var expressions = instructions[instructionIds[i]].expressions;
          if (expressions) {
            for (var ii = 0; i < expressions.length; i++) {
              if (expressions[ii].targetProperty === 'matcher') {
                var matcherBinding = expressions[ii];
                expressions.splice(ii, 1);
                return matcherBinding;
              }
            }
          }
        }
      }

      return undefined;
    };

    Repeat.prototype.viewCount = function viewCount() {
      return this.viewSlot.children.length;
    };

    Repeat.prototype.views = function views() {
      return this.viewSlot.children;
    };

    Repeat.prototype.view = function view(index) {
      return this.viewSlot.children[index];
    };

    Repeat.prototype.matcher = function matcher() {
      return this.matcherBinding ? this.matcherBinding.sourceExpression.evaluate(this.scope, this.matcherBinding.lookupFunctions) : null;
    };

    Repeat.prototype.addView = function addView(bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.add(view);
    };

    Repeat.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.insert(index, view);
    };

    Repeat.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      this.viewSlot.move(sourceIndex, targetIndex);
    };

    Repeat.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      return this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Repeat.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
    };

    Repeat.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
    };

    Repeat.prototype.updateBindings = function updateBindings(view) {
      var j = view.bindings.length;
      while (j--) {
        (0, _repeatUtilities.updateOneTimeBinding)(view.bindings[j]);
      }
      j = view.controllers.length;
      while (j--) {
        var k = view.controllers[j].boundProperties.length;
        while (k--) {
          var binding = view.controllers[j].boundProperties[k].binding;
          (0, _repeatUtilities.updateOneTimeBinding)(binding);
        }
      }
    };

    return Repeat;
  }(_abstractRepeater.AbstractRepeater), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'items', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'local', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'key', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat-strategy-locator',['exports', './null-repeat-strategy', './array-repeat-strategy', './map-repeat-strategy', './set-repeat-strategy', './number-repeat-strategy'], function (exports, _nullRepeatStrategy, _arrayRepeatStrategy, _mapRepeatStrategy, _setRepeatStrategy, _numberRepeatStrategy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RepeatStrategyLocator = undefined;

  

  var RepeatStrategyLocator = exports.RepeatStrategyLocator = function () {
    function RepeatStrategyLocator() {
      

      this.matchers = [];
      this.strategies = [];

      this.addStrategy(function (items) {
        return items === null || items === undefined;
      }, new _nullRepeatStrategy.NullRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Array;
      }, new _arrayRepeatStrategy.ArrayRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Map;
      }, new _mapRepeatStrategy.MapRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Set;
      }, new _setRepeatStrategy.SetRepeatStrategy());
      this.addStrategy(function (items) {
        return typeof items === 'number';
      }, new _numberRepeatStrategy.NumberRepeatStrategy());
    }

    RepeatStrategyLocator.prototype.addStrategy = function addStrategy(matcher, strategy) {
      this.matchers.push(matcher);
      this.strategies.push(strategy);
    };

    RepeatStrategyLocator.prototype.getStrategy = function getStrategy(items) {
      var matchers = this.matchers;

      for (var i = 0, ii = matchers.length; i < ii; ++i) {
        if (matchers[i](items)) {
          return this.strategies[i];
        }
      }

      return null;
    };

    return RepeatStrategyLocator;
  }();
});
define('aurelia-templating-resources/null-repeat-strategy',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var NullRepeatStrategy = exports.NullRepeatStrategy = function () {
    function NullRepeatStrategy() {
      
    }

    NullRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      repeat.removeAllViews(true);
    };

    NullRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {};

    return NullRepeatStrategy;
  }();
});
define('aurelia-templating-resources/array-repeat-strategy',['exports', './repeat-utilities', 'aurelia-binding'], function (exports, _repeatUtilities, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ArrayRepeatStrategy = undefined;

  

  var ArrayRepeatStrategy = exports.ArrayRepeatStrategy = function () {
    function ArrayRepeatStrategy() {
      
    }

    ArrayRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getArrayObserver(items);
    };

    ArrayRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var itemsLength = items.length;

      if (!items || itemsLength === 0) {
        repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        return;
      }

      var children = repeat.views();
      var viewsLength = children.length;

      if (viewsLength === 0) {
        this._standardProcessInstanceChanged(repeat, items);
        return;
      }

      if (repeat.viewsRequireLifecycle) {
        (function () {
          var childrenSnapshot = children.slice(0);
          var itemNameInBindingContext = repeat.local;
          var matcher = repeat.matcher();

          var itemsPreviouslyInViews = [];
          var viewsToRemove = [];

          for (var index = 0; index < viewsLength; index++) {
            var view = childrenSnapshot[index];
            var oldItem = view.bindingContext[itemNameInBindingContext];

            if ((0, _repeatUtilities.indexOf)(items, oldItem, matcher) === -1) {
              viewsToRemove.push(view);
            } else {
              itemsPreviouslyInViews.push(oldItem);
            }
          }

          var updateViews = void 0;
          var removePromise = void 0;

          if (itemsPreviouslyInViews.length > 0) {
            removePromise = repeat.removeViews(viewsToRemove, true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              for (var _index = 0; _index < itemsLength; _index++) {
                var item = items[_index];
                var indexOfView = (0, _repeatUtilities.indexOf)(itemsPreviouslyInViews, item, matcher, _index);
                var _view = void 0;

                if (indexOfView === -1) {
                  var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_index], _index, itemsLength);
                  repeat.insertView(_index, overrideContext.bindingContext, overrideContext);

                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                } else if (indexOfView === _index) {
                  _view = children[indexOfView];
                  itemsPreviouslyInViews[indexOfView] = undefined;
                } else {
                  _view = children[indexOfView];
                  repeat.moveView(indexOfView, _index);
                  itemsPreviouslyInViews.splice(indexOfView, 1);
                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                }

                if (_view) {
                  (0, _repeatUtilities.updateOverrideContext)(_view.overrideContext, _index, itemsLength);
                }
              }

              _this._inPlaceProcessItems(repeat, items);
            };
          } else {
            removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              return _this._standardProcessInstanceChanged(repeat, items);
            };
          }

          if (removePromise instanceof Promise) {
            removePromise.then(updateViews);
          } else {
            updateViews();
          }
        })();
      } else {
        this._inPlaceProcessItems(repeat, items);
      }
    };

    ArrayRepeatStrategy.prototype._standardProcessInstanceChanged = function _standardProcessInstanceChanged(repeat, items) {
      for (var i = 0, ii = items.length; i < ii; i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[i], i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype._inPlaceProcessItems = function _inPlaceProcessItems(repeat, items) {
      var itemsLength = items.length;
      var viewsLength = repeat.viewCount();

      while (viewsLength > itemsLength) {
        viewsLength--;
        repeat.removeView(viewsLength, true, !repeat.viewsRequireLifecycle);
      }

      var local = repeat.local;

      for (var i = 0; i < viewsLength; i++) {
        var view = repeat.view(i);
        var last = i === itemsLength - 1;
        var middle = i !== 0 && !last;

        if (view.bindingContext[local] === items[i] && view.overrideContext.$middle === middle && view.overrideContext.$last === last) {
          continue;
        }

        view.bindingContext[local] = items[i];
        view.overrideContext.$middle = middle;
        view.overrideContext.$last = last;
        repeat.updateBindings(view);
      }

      for (var _i = viewsLength; _i < itemsLength; _i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_i], _i, itemsLength);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, array, splices) {
      var _this2 = this;

      if (repeat.__queuedSplices) {
        for (var i = 0, ii = splices.length; i < ii; ++i) {
          var _splices$i = splices[i],
              index = _splices$i.index,
              removed = _splices$i.removed,
              addedCount = _splices$i.addedCount;

          (0, _aureliaBinding.mergeSplice)(repeat.__queuedSplices, index, removed, addedCount);
        }

        repeat.__array = array.slice(0);
        return;
      }

      var maybePromise = this._runSplices(repeat, array.slice(0), splices);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedSplices = repeat.__queuedSplices = [];

          var runQueuedSplices = function runQueuedSplices() {
            if (!queuedSplices.length) {
              repeat.__queuedSplices = undefined;
              repeat.__array = undefined;
              return;
            }

            var nextPromise = _this2._runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
            queuedSplices = repeat.__queuedSplices = [];
            nextPromise.then(runQueuedSplices);
          };

          maybePromise.then(runQueuedSplices);
        })();
      }
    };

    ArrayRepeatStrategy.prototype._runSplices = function _runSplices(repeat, array, splices) {
      var _this3 = this;

      var removeDelta = 0;
      var rmPromises = [];

      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var removed = splice.removed;

        for (var j = 0, jj = removed.length; j < jj; ++j) {
          var viewOrPromise = repeat.removeView(splice.index + removeDelta + rmPromises.length, true);
          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }
        }
        removeDelta -= splice.addedCount;
      }

      if (rmPromises.length > 0) {
        return Promise.all(rmPromises).then(function () {
          var spliceIndexLow = _this3._handleAddedSplices(repeat, array, splices);
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);
        });
      }

      var spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);

      return undefined;
    };

    ArrayRepeatStrategy.prototype._handleAddedSplices = function _handleAddedSplices(repeat, array, splices) {
      var spliceIndex = void 0;
      var spliceIndexLow = void 0;
      var arrayLength = array.length;
      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var addIndex = spliceIndex = splice.index;
        var end = splice.index + splice.addedCount;

        if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
          spliceIndexLow = spliceIndex;
        }

        for (; addIndex < end; ++addIndex) {
          var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, array[addIndex], addIndex, arrayLength);
          repeat.insertView(addIndex, overrideContext.bindingContext, overrideContext);
        }
      }

      return spliceIndexLow;
    };

    return ArrayRepeatStrategy;
  }();
});
define('aurelia-templating-resources/repeat-utilities',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.updateOverrideContexts = updateOverrideContexts;
  exports.createFullOverrideContext = createFullOverrideContext;
  exports.updateOverrideContext = updateOverrideContext;
  exports.getItemsSourceExpression = getItemsSourceExpression;
  exports.unwrapExpression = unwrapExpression;
  exports.isOneTime = isOneTime;
  exports.updateOneTimeBinding = updateOneTimeBinding;
  exports.indexOf = indexOf;


  var oneTime = _aureliaBinding.bindingMode.oneTime;

  function updateOverrideContexts(views, startIndex) {
    var length = views.length;

    if (startIndex > 0) {
      startIndex = startIndex - 1;
    }

    for (; startIndex < length; ++startIndex) {
      updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
    }
  }

  function createFullOverrideContext(repeat, data, index, length, key) {
    var bindingContext = {};
    var overrideContext = (0, _aureliaBinding.createOverrideContext)(bindingContext, repeat.scope.overrideContext);

    if (typeof key !== 'undefined') {
      bindingContext[repeat.key] = key;
      bindingContext[repeat.value] = data;
    } else {
      bindingContext[repeat.local] = data;
    }
    updateOverrideContext(overrideContext, index, length);
    return overrideContext;
  }

  function updateOverrideContext(overrideContext, index, length) {
    var first = index === 0;
    var last = index === length - 1;
    var even = index % 2 === 0;

    overrideContext.$index = index;
    overrideContext.$first = first;
    overrideContext.$last = last;
    overrideContext.$middle = !(first || last);
    overrideContext.$odd = !even;
    overrideContext.$even = even;
  }

  function getItemsSourceExpression(instruction, attrName) {
    return instruction.behaviorInstructions.filter(function (bi) {
      return bi.originalAttrName === attrName;
    })[0].attributes.items.sourceExpression;
  }

  function unwrapExpression(expression) {
    var unwrapped = false;
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      expression = expression.expression;
    }
    while (expression instanceof _aureliaBinding.ValueConverter) {
      expression = expression.expression;
      unwrapped = true;
    }
    return unwrapped ? expression : null;
  }

  function isOneTime(expression) {
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      if (expression.name === 'oneTime') {
        return true;
      }
      expression = expression.expression;
    }
    return false;
  }

  function updateOneTimeBinding(binding) {
    if (binding.call && binding.mode === oneTime) {
      binding.call(_aureliaBinding.sourceContext);
    } else if (binding.updateOneTimeBindings) {
      binding.updateOneTimeBindings();
    }
  }

  function indexOf(array, item, matcher, startIndex) {
    if (!matcher) {
      return array.indexOf(item);
    }
    var length = array.length;
    for (var index = startIndex || 0; index < length; index++) {
      if (matcher(array[index], item)) {
        return index;
      }
    }
    return -1;
  }
});
define('aurelia-templating-resources/map-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MapRepeatStrategy = undefined;

  

  var MapRepeatStrategy = exports.MapRepeatStrategy = function () {
    function MapRepeatStrategy() {
      
    }

    MapRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getMapObserver(items);
    };

    MapRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    MapRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value, key) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size, key);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    MapRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, map, records) {
      var key = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        key = record.key;
        switch (record.type) {
          case 'update':
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), removeIndex, map.size, key);
            repeat.insertView(removeIndex, overrideContext.bindingContext, overrideContext);
            break;
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), map.size - 1, map.size, key);
            repeat.insertView(map.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            if (record.oldValue === undefined) {
              return;
            }
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    MapRepeatStrategy.prototype._getViewIndexByKey = function _getViewIndexByKey(repeat, key) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.key] === key) {
          return i;
        }
      }

      return undefined;
    };

    return MapRepeatStrategy;
  }();
});
define('aurelia-templating-resources/set-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SetRepeatStrategy = undefined;

  

  var SetRepeatStrategy = exports.SetRepeatStrategy = function () {
    function SetRepeatStrategy() {
      
    }

    SetRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getSetObserver(items);
    };

    SetRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    SetRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    SetRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, set, records) {
      var value = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        value = record.value;
        switch (record.type) {
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, set.size - 1, set.size);
            repeat.insertView(set.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            removeIndex = this._getViewIndexByValue(repeat, value);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    SetRepeatStrategy.prototype._getViewIndexByValue = function _getViewIndexByValue(repeat, value) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.local] === value) {
          return i;
        }
      }

      return undefined;
    };

    return SetRepeatStrategy;
  }();
});
define('aurelia-templating-resources/number-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NumberRepeatStrategy = undefined;

  

  var NumberRepeatStrategy = exports.NumberRepeatStrategy = function () {
    function NumberRepeatStrategy() {
      
    }

    NumberRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver() {
      return null;
    };

    NumberRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, value) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, value);
        });
        return;
      }
      this._standardProcessItems(repeat, value);
    };

    NumberRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, value) {
      var childrenLength = repeat.viewCount();
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var viewsToRemove = void 0;

      value = Math.floor(value);
      viewsToRemove = childrenLength - value;

      if (viewsToRemove > 0) {
        if (viewsToRemove > childrenLength) {
          viewsToRemove = childrenLength;
        }

        for (i = 0, ii = viewsToRemove; i < ii; ++i) {
          repeat.removeView(childrenLength - (i + 1), true, !repeat.viewsRequireLifecycle);
        }

        return;
      }

      for (i = childrenLength, ii = value; i < ii; ++i) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, i, i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }

      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
    };

    return NumberRepeatStrategy;
  }();
});
define('aurelia-templating-resources/analyze-view-factory',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.viewsRequireLifecycle = viewsRequireLifecycle;
  var lifecycleOptionalBehaviors = exports.lifecycleOptionalBehaviors = ['focus', 'if', 'repeat', 'show', 'with'];

  function behaviorRequiresLifecycle(instruction) {
    var t = instruction.type;
    var name = t.elementName !== null ? t.elementName : t.attributeName;
    return lifecycleOptionalBehaviors.indexOf(name) === -1 && (t.handlesAttached || t.handlesBind || t.handlesCreated || t.handlesDetached || t.handlesUnbind) || t.viewFactory && viewsRequireLifecycle(t.viewFactory) || instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function targetRequiresLifecycle(instruction) {
    var behaviors = instruction.behaviorInstructions;
    if (behaviors) {
      var i = behaviors.length;
      while (i--) {
        if (behaviorRequiresLifecycle(behaviors[i])) {
          return true;
        }
      }
    }

    return instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function viewsRequireLifecycle(viewFactory) {
    if ('_viewsRequireLifecycle' in viewFactory) {
      return viewFactory._viewsRequireLifecycle;
    }

    viewFactory._viewsRequireLifecycle = false;

    if (viewFactory.viewFactory) {
      viewFactory._viewsRequireLifecycle = viewsRequireLifecycle(viewFactory.viewFactory);
      return viewFactory._viewsRequireLifecycle;
    }

    if (viewFactory.template.querySelector('.au-animate')) {
      viewFactory._viewsRequireLifecycle = true;
      return true;
    }

    for (var id in viewFactory.instructions) {
      if (targetRequiresLifecycle(viewFactory.instructions[id])) {
        viewFactory._viewsRequireLifecycle = true;
        return true;
      }
    }

    viewFactory._viewsRequireLifecycle = false;
    return false;
  }
});
define('aurelia-templating-resources/abstract-repeater',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var AbstractRepeater = exports.AbstractRepeater = function () {
    function AbstractRepeater(options) {
      

      Object.assign(this, {
        local: 'items',
        viewsRequireLifecycle: true
      }, options);
    }

    AbstractRepeater.prototype.viewCount = function viewCount() {
      throw new Error('subclass must implement `viewCount`');
    };

    AbstractRepeater.prototype.views = function views() {
      throw new Error('subclass must implement `views`');
    };

    AbstractRepeater.prototype.view = function view(index) {
      throw new Error('subclass must implement `view`');
    };

    AbstractRepeater.prototype.matcher = function matcher() {
      throw new Error('subclass must implement `matcher`');
    };

    AbstractRepeater.prototype.addView = function addView(bindingContext, overrideContext) {
      throw new Error('subclass must implement `addView`');
    };

    AbstractRepeater.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      throw new Error('subclass must implement `insertView`');
    };

    AbstractRepeater.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      throw new Error('subclass must implement `moveView`');
    };

    AbstractRepeater.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeAllViews`');
    };

    AbstractRepeater.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.updateBindings = function updateBindings(view) {
      throw new Error('subclass must implement `updateBindings`');
    };

    return AbstractRepeater;
  }();
});
define('aurelia-templating-resources/show',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Show = undefined;

  

  var _dec, _dec2, _class;

  var Show = exports.Show = (_dec = (0, _aureliaTemplating.customAttribute)('show'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Show(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Show.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Show.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Show.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Show;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/aurelia-hide-style',['exports', 'aurelia-pal'], function (exports, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.aureliaHideClassName = undefined;
  exports.injectAureliaHideStyleAtHead = injectAureliaHideStyleAtHead;
  exports.injectAureliaHideStyleAtBoundary = injectAureliaHideStyleAtBoundary;
  var aureliaHideClassName = exports.aureliaHideClassName = 'aurelia-hide';

  var aureliaHideClass = '.' + aureliaHideClassName + ' { display:none !important; }';

  function injectAureliaHideStyleAtHead() {
    _aureliaPal.DOM.injectStyles(aureliaHideClass);
  }

  function injectAureliaHideStyleAtBoundary(domBoundary) {
    if (_aureliaPal.FEATURE.shadowDOM && domBoundary && !domBoundary.hasAureliaHideStyle) {
      domBoundary.hasAureliaHideStyle = true;
      _aureliaPal.DOM.injectStyles(aureliaHideClass, domBoundary);
    }
  }
});
define('aurelia-templating-resources/hide',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Hide = undefined;

  

  var _dec, _dec2, _class;

  var Hide = exports.Hide = (_dec = (0, _aureliaTemplating.customAttribute)('hide'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Hide(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Hide.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Hide.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Hide.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Hide;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/sanitize-html',['exports', 'aurelia-binding', 'aurelia-dependency-injection', './html-sanitizer'], function (exports, _aureliaBinding, _aureliaDependencyInjection, _htmlSanitizer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SanitizeHTMLValueConverter = undefined;

  

  var _dec, _dec2, _class;

  var SanitizeHTMLValueConverter = exports.SanitizeHTMLValueConverter = (_dec = (0, _aureliaBinding.valueConverter)('sanitizeHTML'), _dec2 = (0, _aureliaDependencyInjection.inject)(_htmlSanitizer.HTMLSanitizer), _dec(_class = _dec2(_class = function () {
    function SanitizeHTMLValueConverter(sanitizer) {
      

      this.sanitizer = sanitizer;
    }

    SanitizeHTMLValueConverter.prototype.toView = function toView(untrustedMarkup) {
      if (untrustedMarkup === null || untrustedMarkup === undefined) {
        return null;
      }

      return this.sanitizer.sanitize(untrustedMarkup);
    };

    return SanitizeHTMLValueConverter;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/html-sanitizer',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  var HTMLSanitizer = exports.HTMLSanitizer = function () {
    function HTMLSanitizer() {
      
    }

    HTMLSanitizer.prototype.sanitize = function sanitize(input) {
      return input.replace(SCRIPT_REGEX, '');
    };

    return HTMLSanitizer;
  }();
});
define('aurelia-templating-resources/replaceable',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Replaceable = undefined;

  

  var _dec, _dec2, _class;

  var Replaceable = exports.Replaceable = (_dec = (0, _aureliaTemplating.customAttribute)('replaceable'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function Replaceable(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.view = null;
    }

    Replaceable.prototype.bind = function bind(bindingContext, overrideContext) {
      if (this.view === null) {
        this.view = this.viewFactory.create();
        this.viewSlot.add(this.view);
      }

      this.view.bind(bindingContext, overrideContext);
    };

    Replaceable.prototype.unbind = function unbind() {
      this.view.unbind();
    };

    return Replaceable;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/focus',['exports', 'aurelia-templating', 'aurelia-binding', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaBinding, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Focus = undefined;

  

  var _dec, _dec2, _class;

  var Focus = exports.Focus = (_dec = (0, _aureliaTemplating.customAttribute)('focus', _aureliaBinding.bindingMode.twoWay), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTaskQueue.TaskQueue), _dec(_class = _dec2(_class = function () {
    function Focus(element, taskQueue) {
      var _this = this;

      

      this.element = element;
      this.taskQueue = taskQueue;
      this.isAttached = false;
      this.needsApply = false;

      this.focusListener = function (e) {
        _this.value = true;
      };
      this.blurListener = function (e) {
        if (_aureliaPal.DOM.activeElement !== _this.element) {
          _this.value = false;
        }
      };
    }

    Focus.prototype.valueChanged = function valueChanged(newValue) {
      if (this.isAttached) {
        this._apply();
      } else {
        this.needsApply = true;
      }
    };

    Focus.prototype._apply = function _apply() {
      var _this2 = this;

      if (this.value) {
        this.taskQueue.queueMicroTask(function () {
          if (_this2.value) {
            _this2.element.focus();
          }
        });
      } else {
        this.element.blur();
      }
    };

    Focus.prototype.attached = function attached() {
      this.isAttached = true;
      if (this.needsApply) {
        this.needsApply = false;
        this._apply();
      }
      this.element.addEventListener('focus', this.focusListener);
      this.element.addEventListener('blur', this.blurListener);
    };

    Focus.prototype.detached = function detached() {
      this.isAttached = false;
      this.element.removeEventListener('focus', this.focusListener);
      this.element.removeEventListener('blur', this.blurListener);
    };

    return Focus;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/css-resource',['exports', 'aurelia-templating', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-path', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaLoader, _aureliaDependencyInjection, _aureliaPath, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createCSSResource = _createCSSResource;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  var cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

  function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
      throw new Error('Failed loading required CSS file: ' + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
      var quote = p1.charAt(0);
      if (quote === '\'' || quote === '"') {
        p1 = p1.substr(1, p1.length - 2);
      }
      return 'url(\'' + (0, _aureliaPath.relativeToFile)(p1, address) + '\')';
    });
  }

  var CSSResource = function () {
    function CSSResource(address) {
      

      this.address = address;
      this._scoped = null;
      this._global = false;
      this._alreadyGloballyInjected = false;
    }

    CSSResource.prototype.initialize = function initialize(container, target) {
      this._scoped = new target(this);
    };

    CSSResource.prototype.register = function register(registry, name) {
      if (name === 'scoped') {
        registry.registerViewEngineHooks(this._scoped);
      } else {
        this._global = true;
      }
    };

    CSSResource.prototype.load = function load(container) {
      var _this = this;

      return container.get(_aureliaLoader.Loader).loadText(this.address).catch(function (err) {
        return null;
      }).then(function (text) {
        text = fixupCSSUrls(_this.address, text);
        _this._scoped.css = text;
        if (_this._global) {
          _this._alreadyGloballyInjected = true;
          _aureliaPal.DOM.injectStyles(text);
        }
      });
    };

    return CSSResource;
  }();

  var CSSViewEngineHooks = function () {
    function CSSViewEngineHooks(owner) {
      

      this.owner = owner;
      this.css = null;
    }

    CSSViewEngineHooks.prototype.beforeCompile = function beforeCompile(content, resources, instruction) {
      if (instruction.targetShadowDOM) {
        _aureliaPal.DOM.injectStyles(this.css, content, true);
      } else if (_aureliaPal.FEATURE.scopedCSS) {
        var styleNode = _aureliaPal.DOM.injectStyles(this.css, content, true);
        styleNode.setAttribute('scoped', 'scoped');
      } else if (!this.owner._alreadyGloballyInjected) {
        _aureliaPal.DOM.injectStyles(this.css);
        this.owner._alreadyGloballyInjected = true;
      }
    };

    return CSSViewEngineHooks;
  }();

  function _createCSSResource(address) {
    var _dec, _class;

    var ViewCSS = (_dec = (0, _aureliaTemplating.resource)(new CSSResource(address)), _dec(_class = function (_CSSViewEngineHooks) {
      _inherits(ViewCSS, _CSSViewEngineHooks);

      function ViewCSS() {
        

        return _possibleConstructorReturn(this, _CSSViewEngineHooks.apply(this, arguments));
      }

      return ViewCSS;
    }(CSSViewEngineHooks)) || _class);

    return ViewCSS;
  }
});
define('aurelia-templating-resources/attr-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AttrBindingBehavior = undefined;

  

  var AttrBindingBehavior = exports.AttrBindingBehavior = function () {
    function AttrBindingBehavior() {
      
    }

    AttrBindingBehavior.prototype.bind = function bind(binding, source) {
      binding.targetObserver = new _aureliaBinding.DataAttributeObserver(binding.target, binding.targetProperty);
    };

    AttrBindingBehavior.prototype.unbind = function unbind(binding, source) {};

    return AttrBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-mode-behaviors',['exports', 'aurelia-binding', 'aurelia-metadata'], function (exports, _aureliaBinding, _aureliaMetadata) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TwoWayBindingBehavior = exports.OneWayBindingBehavior = exports.OneTimeBindingBehavior = undefined;

  

  var _dec, _class, _dec2, _class2, _dec3, _class3;

  var modeBindingBehavior = {
    bind: function bind(binding, source, lookupFunctions) {
      binding.originalMode = binding.mode;
      binding.mode = this.mode;
    },
    unbind: function unbind(binding, source) {
      binding.mode = binding.originalMode;
      binding.originalMode = null;
    }
  };

  var OneTimeBindingBehavior = exports.OneTimeBindingBehavior = (_dec = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec(_class = function OneTimeBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneTime;
  }) || _class);
  var OneWayBindingBehavior = exports.OneWayBindingBehavior = (_dec2 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec2(_class2 = function OneWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneWay;
  }) || _class2);
  var TwoWayBindingBehavior = exports.TwoWayBindingBehavior = (_dec3 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec3(_class3 = function TwoWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.twoWay;
  }) || _class3);
});
define('aurelia-templating-resources/throttle-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ThrottleBindingBehavior = undefined;

  

  function throttle(newValue) {
    var _this = this;

    var state = this.throttleState;
    var elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
      state.last = +new Date();
      this.throttledMethod(newValue);
      return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
      state.timeoutId = setTimeout(function () {
        state.timeoutId = null;
        state.last = +new Date();
        _this.throttledMethod(state.newValue);
      }, state.delay - elapsed);
    }
  }

  var ThrottleBindingBehavior = exports.ThrottleBindingBehavior = function () {
    function ThrottleBindingBehavior() {
      
    }

    ThrottleBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToThrottle = 'updateTarget';
      if (binding.callSource) {
        methodToThrottle = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToThrottle = 'updateSource';
      }

      binding.throttledMethod = binding[methodToThrottle];
      binding.throttledMethod.originalName = methodToThrottle;

      binding[methodToThrottle] = throttle;

      binding.throttleState = {
        delay: delay,
        last: 0,
        timeoutId: null
      };
    };

    ThrottleBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.throttledMethod.originalName;
      binding[methodToRestore] = binding.throttledMethod;
      binding.throttledMethod = null;
      clearTimeout(binding.throttleState.timeoutId);
      binding.throttleState = null;
    };

    return ThrottleBindingBehavior;
  }();
});
define('aurelia-templating-resources/debounce-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DebounceBindingBehavior = undefined;

  

  function debounce(newValue) {
    var _this = this;

    var state = this.debounceState;
    if (state.immediate) {
      state.immediate = false;
      this.debouncedMethod(newValue);
      return;
    }
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(function () {
      return _this.debouncedMethod(newValue);
    }, state.delay);
  }

  var DebounceBindingBehavior = exports.DebounceBindingBehavior = function () {
    function DebounceBindingBehavior() {
      
    }

    DebounceBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToDebounce = 'updateTarget';
      if (binding.callSource) {
        methodToDebounce = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToDebounce = 'updateSource';
      }

      binding.debouncedMethod = binding[methodToDebounce];
      binding.debouncedMethod.originalName = methodToDebounce;

      binding[methodToDebounce] = debounce;

      binding.debounceState = {
        delay: delay,
        timeoutId: null,
        immediate: methodToDebounce === 'updateTarget' };
    };

    DebounceBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.debouncedMethod.originalName;
      binding[methodToRestore] = binding.debouncedMethod;
      binding.debouncedMethod = null;
      clearTimeout(binding.debounceState.timeoutId);
      binding.debounceState = null;
    };

    return DebounceBindingBehavior;
  }();
});
define('aurelia-templating-resources/self-binding-behavior',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  function findOriginalEventTarget(event) {
    return event.path && event.path[0] || event.deepPath && event.deepPath[0] || event.target;
  }

  function handleSelfEvent(event) {
    var target = findOriginalEventTarget(event);
    if (this.target !== target) return;
    this.selfEventCallSource(event);
  }

  var SelfBindingBehavior = exports.SelfBindingBehavior = function () {
    function SelfBindingBehavior() {
      
    }

    SelfBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.callSource || !binding.targetEvent) throw new Error('Self binding behavior only supports event.');
      binding.selfEventCallSource = binding.callSource;
      binding.callSource = handleSelfEvent;
    };

    SelfBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.callSource = binding.selfEventCallSource;
      binding.selfEventCallSource = null;
    };

    return SelfBindingBehavior;
  }();
});
define('aurelia-templating-resources/signal-binding-behavior',['exports', './binding-signaler'], function (exports, _bindingSignaler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SignalBindingBehavior = undefined;

  

  var SignalBindingBehavior = exports.SignalBindingBehavior = function () {
    SignalBindingBehavior.inject = function inject() {
      return [_bindingSignaler.BindingSignaler];
    };

    function SignalBindingBehavior(bindingSignaler) {
      

      this.signals = bindingSignaler.signals;
    }

    SignalBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.updateTarget) {
        throw new Error('Only property bindings and string interpolation bindings can be signaled.  Trigger, delegate and call bindings cannot be signaled.');
      }
      if (arguments.length === 3) {
        var name = arguments[2];
        var bindings = this.signals[name] || (this.signals[name] = []);
        bindings.push(binding);
        binding.signalName = name;
      } else if (arguments.length > 3) {
        var names = Array.prototype.slice.call(arguments, 2);
        var i = names.length;
        while (i--) {
          var _name = names[i];
          var _bindings = this.signals[_name] || (this.signals[_name] = []);
          _bindings.push(binding);
        }
        binding.signalName = names;
      } else {
        throw new Error('Signal name is required.');
      }
    };

    SignalBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var name = binding.signalName;
      binding.signalName = null;
      if (Array.isArray(name)) {
        var names = name;
        var i = names.length;
        while (i--) {
          var n = names[i];
          var bindings = this.signals[n];
          bindings.splice(bindings.indexOf(binding), 1);
        }
      } else {
        var _bindings2 = this.signals[name];
        _bindings2.splice(_bindings2.indexOf(binding), 1);
      }
    };

    return SignalBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-signaler',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BindingSignaler = undefined;

  

  var BindingSignaler = exports.BindingSignaler = function () {
    function BindingSignaler() {
      

      this.signals = {};
    }

    BindingSignaler.prototype.signal = function signal(name) {
      var bindings = this.signals[name];
      if (!bindings) {
        return;
      }
      var i = bindings.length;
      while (i--) {
        bindings[i].call(_aureliaBinding.sourceContext);
      }
    };

    return BindingSignaler;
  }();
});
define('aurelia-templating-resources/update-trigger-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UpdateTriggerBindingBehavior = undefined;

  

  var _class, _temp;

  var eventNamesRequired = 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">';
  var notApplicableMessage = 'The updateTrigger binding behavior can only be applied to two-way bindings on input/select elements.';

  var UpdateTriggerBindingBehavior = exports.UpdateTriggerBindingBehavior = (_temp = _class = function () {
    function UpdateTriggerBindingBehavior(eventManager) {
      

      this.eventManager = eventManager;
    }

    UpdateTriggerBindingBehavior.prototype.bind = function bind(binding, source) {
      for (var _len = arguments.length, events = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        events[_key - 2] = arguments[_key];
      }

      if (events.length === 0) {
        throw new Error(eventNamesRequired);
      }
      if (binding.mode !== _aureliaBinding.bindingMode.twoWay) {
        throw new Error(notApplicableMessage);
      }

      var targetObserver = binding.observerLocator.getObserver(binding.target, binding.targetProperty);
      if (!targetObserver.handler) {
        throw new Error(notApplicableMessage);
      }
      binding.targetObserver = targetObserver;

      targetObserver.originalHandler = binding.targetObserver.handler;

      var handler = this.eventManager.createElementHandler(events);
      targetObserver.handler = handler;
    };

    UpdateTriggerBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.targetObserver.handler = binding.targetObserver.originalHandler;
      binding.targetObserver.originalHandler = null;
    };

    return UpdateTriggerBindingBehavior;
  }(), _class.inject = [_aureliaBinding.EventManager], _temp);
});
define('aurelia-templating-resources/html-resource-plugin',['exports', 'aurelia-templating', './dynamic-element'], function (exports, _aureliaTemplating, _dynamicElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getElementName = getElementName;
  exports.configure = configure;
  function getElementName(address) {
    return (/([^\/^\?]+)\.html/i.exec(address)[1].toLowerCase()
    );
  }

  function configure(config) {
    var viewEngine = config.container.get(_aureliaTemplating.ViewEngine);
    var loader = config.aurelia.loader;

    viewEngine.addResourcePlugin('.html', {
      'fetch': function fetch(address) {
        return loader.loadTemplate(address).then(function (registryEntry) {
          var _ref;

          var bindable = registryEntry.template.getAttribute('bindable');
          var elementName = getElementName(address);

          if (bindable) {
            bindable = bindable.split(',').map(function (x) {
              return x.trim();
            });
            registryEntry.template.removeAttribute('bindable');
          } else {
            bindable = [];
          }

          return _ref = {}, _ref[elementName] = (0, _dynamicElement._createDynamicElement)(elementName, address, bindable), _ref;
        });
      }
    });
  }
});
define('aurelia-templating-resources/dynamic-element',['exports', 'aurelia-templating'], function (exports, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createDynamicElement = _createDynamicElement;

  

  function _createDynamicElement(name, viewUrl, bindableNames) {
    var _dec, _dec2, _class;

    var DynamicElement = (_dec = (0, _aureliaTemplating.customElement)(name), _dec2 = (0, _aureliaTemplating.useView)(viewUrl), _dec(_class = _dec2(_class = function () {
      function DynamicElement() {
        
      }

      DynamicElement.prototype.bind = function bind(bindingContext) {
        this.$parent = bindingContext;
      };

      return DynamicElement;
    }()) || _class) || _class);

    for (var i = 0, ii = bindableNames.length; i < ii; ++i) {
      (0, _aureliaTemplating.bindable)(bindableNames[i])(DynamicElement);
    }
    return DynamicElement;
  }
});
define('aurelia-authentication/authFilterValueConverter',['exports', 'aurelia-router'], function (exports, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthFilterValueConverter = undefined;

  

  var AuthFilterValueConverter = exports.AuthFilterValueConverter = function () {
    function AuthFilterValueConverter() {
      
    }

    AuthFilterValueConverter.prototype.toView = function toView(routes, isAuthenticated) {
      return routes.filter(function (route) {
        return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
      });
    };

    return AuthFilterValueConverter;
  }();
});
define('aurelia-authentication/authenticatedValueConverter',['exports', 'aurelia-dependency-injection', './aurelia-authentication'], function (exports, _aureliaDependencyInjection, _aureliaAuthentication) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthenticatedValueConverter = undefined;

  

  var _dec, _class;

  var AuthenticatedValueConverter = exports.AuthenticatedValueConverter = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaAuthentication.AuthService), _dec(_class = function () {
    function AuthenticatedValueConverter(authService) {
      

      this.authService = authService;
    }

    AuthenticatedValueConverter.prototype.toView = function toView() {
      return this.authService.authenticated;
    };

    return AuthenticatedValueConverter;
  }()) || _class);
});
define('aurelia-authentication/authenticatedFilterValueConverter',['exports', 'aurelia-dependency-injection', './aurelia-authentication', 'aurelia-router'], function (exports, _aureliaDependencyInjection, _aureliaAuthentication, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthenticatedFilterValueConverter = undefined;

  

  var _dec, _class;

  var AuthenticatedFilterValueConverter = exports.AuthenticatedFilterValueConverter = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaAuthentication.AuthService), _dec(_class = function () {
    function AuthenticatedFilterValueConverter(authService) {
      

      this.authService = authService;
    }

    AuthenticatedFilterValueConverter.prototype.toView = function toView(routes) {
      var isAuthenticated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.authService.authenticated;

      return routes.filter(function (route) {
        return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
      });
    };

    return AuthenticatedFilterValueConverter;
  }()) || _class);
});
define('aurelia-validation/get-target-dom-element',["require", "exports", "aurelia-pal"], function (require, exports, aurelia_pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Gets the DOM element associated with the data-binding. Most of the time it's
     * the binding.target but sometimes binding.target is an aurelia custom element,
     * or custom attribute which is a javascript "class" instance, so we need to use
     * the controller's container to retrieve the actual DOM element.
     */
    function getTargetDOMElement(binding, view) {
        var target = binding.target;
        // DOM element
        if (target instanceof Element) {
            return target;
        }
        // custom element or custom attribute
        // tslint:disable-next-line:prefer-const
        for (var i = 0, ii = view.controllers.length; i < ii; i++) {
            var controller = view.controllers[i];
            if (controller.viewModel === target) {
                var element = controller.container.get(aurelia_pal_1.DOM.Element);
                if (element) {
                    return element;
                }
                throw new Error("Unable to locate target element for \"" + binding.sourceExpression + "\".");
            }
        }
        throw new Error("Unable to locate target element for \"" + binding.sourceExpression + "\".");
    }
    exports.getTargetDOMElement = getTargetDOMElement;
});

define('aurelia-validation/property-info',["require", "exports", "aurelia-binding"], function (require, exports, aurelia_binding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getObject(expression, objectExpression, source) {
        var value = objectExpression.evaluate(source, null);
        if (value === null || value === undefined || value instanceof Object) {
            return value;
        }
        // tslint:disable-next-line:max-line-length
        throw new Error("The '" + objectExpression + "' part of '" + expression + "' evaluates to " + value + " instead of an object, null or undefined.");
    }
    /**
     * Retrieves the object and property name for the specified expression.
     * @param expression The expression
     * @param source The scope
     */
    function getPropertyInfo(expression, source) {
        var originalExpression = expression;
        while (expression instanceof aurelia_binding_1.BindingBehavior || expression instanceof aurelia_binding_1.ValueConverter) {
            expression = expression.expression;
        }
        var object;
        var propertyName;
        if (expression instanceof aurelia_binding_1.AccessScope) {
            object = source.bindingContext;
            propertyName = expression.name;
        }
        else if (expression instanceof aurelia_binding_1.AccessMember) {
            object = getObject(originalExpression, expression.object, source);
            propertyName = expression.name;
        }
        else if (expression instanceof aurelia_binding_1.AccessKeyed) {
            object = getObject(originalExpression, expression.object, source);
            propertyName = expression.key.evaluate(source);
        }
        else {
            throw new Error("Expression '" + originalExpression + "' is not compatible with the validate binding-behavior.");
        }
        if (object === null || object === undefined) {
            return null;
        }
        return { object: object, propertyName: propertyName };
    }
    exports.getPropertyInfo = getPropertyInfo;
});

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('aurelia-validation/validate-binding-behavior',["require", "exports", "aurelia-task-queue", "./validate-trigger", "./validate-binding-behavior-base"], function (require, exports, aurelia_task_queue_1, validate_trigger_1, validate_binding_behavior_base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Binding behavior. Indicates the bound property should be validated
     * when the validate trigger specified by the associated controller's
     * validateTrigger property occurs.
     */
    var ValidateBindingBehavior = (function (_super) {
        __extends(ValidateBindingBehavior, _super);
        function ValidateBindingBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ValidateBindingBehavior.prototype.getValidateTrigger = function (controller) {
            return controller.validateTrigger;
        };
        return ValidateBindingBehavior;
    }(validate_binding_behavior_base_1.ValidateBindingBehaviorBase));
    ValidateBindingBehavior.inject = [aurelia_task_queue_1.TaskQueue];
    exports.ValidateBindingBehavior = ValidateBindingBehavior;
    /**
     * Binding behavior. Indicates the bound property will be validated
     * manually, by calling controller.validate(). No automatic validation
     * triggered by data-entry or blur will occur.
     */
    var ValidateManuallyBindingBehavior = (function (_super) {
        __extends(ValidateManuallyBindingBehavior, _super);
        function ValidateManuallyBindingBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ValidateManuallyBindingBehavior.prototype.getValidateTrigger = function () {
            return validate_trigger_1.validateTrigger.manual;
        };
        return ValidateManuallyBindingBehavior;
    }(validate_binding_behavior_base_1.ValidateBindingBehaviorBase));
    ValidateManuallyBindingBehavior.inject = [aurelia_task_queue_1.TaskQueue];
    exports.ValidateManuallyBindingBehavior = ValidateManuallyBindingBehavior;
    /**
     * Binding behavior. Indicates the bound property should be validated
     * when the associated element blurs.
     */
    var ValidateOnBlurBindingBehavior = (function (_super) {
        __extends(ValidateOnBlurBindingBehavior, _super);
        function ValidateOnBlurBindingBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ValidateOnBlurBindingBehavior.prototype.getValidateTrigger = function () {
            return validate_trigger_1.validateTrigger.blur;
        };
        return ValidateOnBlurBindingBehavior;
    }(validate_binding_behavior_base_1.ValidateBindingBehaviorBase));
    ValidateOnBlurBindingBehavior.inject = [aurelia_task_queue_1.TaskQueue];
    exports.ValidateOnBlurBindingBehavior = ValidateOnBlurBindingBehavior;
    /**
     * Binding behavior. Indicates the bound property should be validated
     * when the associated element is changed by the user, causing a change
     * to the model.
     */
    var ValidateOnChangeBindingBehavior = (function (_super) {
        __extends(ValidateOnChangeBindingBehavior, _super);
        function ValidateOnChangeBindingBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ValidateOnChangeBindingBehavior.prototype.getValidateTrigger = function () {
            return validate_trigger_1.validateTrigger.change;
        };
        return ValidateOnChangeBindingBehavior;
    }(validate_binding_behavior_base_1.ValidateBindingBehaviorBase));
    ValidateOnChangeBindingBehavior.inject = [aurelia_task_queue_1.TaskQueue];
    exports.ValidateOnChangeBindingBehavior = ValidateOnChangeBindingBehavior;
    /**
     * Binding behavior. Indicates the bound property should be validated
     * when the associated element blurs or is changed by the user, causing
     * a change to the model.
     */
    var ValidateOnChangeOrBlurBindingBehavior = (function (_super) {
        __extends(ValidateOnChangeOrBlurBindingBehavior, _super);
        function ValidateOnChangeOrBlurBindingBehavior() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ValidateOnChangeOrBlurBindingBehavior.prototype.getValidateTrigger = function () {
            return validate_trigger_1.validateTrigger.changeOrBlur;
        };
        return ValidateOnChangeOrBlurBindingBehavior;
    }(validate_binding_behavior_base_1.ValidateBindingBehaviorBase));
    ValidateOnChangeOrBlurBindingBehavior.inject = [aurelia_task_queue_1.TaskQueue];
    exports.ValidateOnChangeOrBlurBindingBehavior = ValidateOnChangeOrBlurBindingBehavior;
});

define('aurelia-validation/validate-trigger',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Validation triggers.
     */
    var validateTrigger;
    (function (validateTrigger) {
        /**
         * Manual validation.  Use the controller's `validate()` and  `reset()` methods
         * to validate all bindings.
         */
        validateTrigger[validateTrigger["manual"] = 0] = "manual";
        /**
         * Validate the binding when the binding's target element fires a DOM "blur" event.
         */
        validateTrigger[validateTrigger["blur"] = 1] = "blur";
        /**
         * Validate the binding when it updates the model due to a change in the view.
         */
        validateTrigger[validateTrigger["change"] = 2] = "change";
        /**
         * Validate the binding when the binding's target element fires a DOM "blur" event and
         * when it updates the model due to a change in the view.
         */
        validateTrigger[validateTrigger["changeOrBlur"] = 3] = "changeOrBlur";
    })(validateTrigger = exports.validateTrigger || (exports.validateTrigger = {}));
    ;
});

define('aurelia-validation/validate-binding-behavior-base',["require", "exports", "aurelia-dependency-injection", "./validation-controller", "./validate-trigger", "./get-target-dom-element"], function (require, exports, aurelia_dependency_injection_1, validation_controller_1, validate_trigger_1, get_target_dom_element_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Binding behavior. Indicates the bound property should be validated.
     */
    var ValidateBindingBehaviorBase = (function () {
        function ValidateBindingBehaviorBase(taskQueue) {
            this.taskQueue = taskQueue;
        }
        ValidateBindingBehaviorBase.prototype.bind = function (binding, source, rulesOrController, rules) {
            var _this = this;
            // identify the target element.
            var target = get_target_dom_element_1.getTargetDOMElement(binding, source);
            // locate the controller.
            var controller;
            if (rulesOrController instanceof validation_controller_1.ValidationController) {
                controller = rulesOrController;
            }
            else {
                controller = source.container.get(aurelia_dependency_injection_1.Optional.of(validation_controller_1.ValidationController));
                rules = rulesOrController;
            }
            if (controller === null) {
                throw new Error("A ValidationController has not been registered.");
            }
            controller.registerBinding(binding, target, rules);
            binding.validationController = controller;
            var trigger = this.getValidateTrigger(controller);
            // tslint:disable-next-line:no-bitwise
            if (trigger & validate_trigger_1.validateTrigger.change) {
                binding.standardUpdateSource = binding.updateSource;
                // tslint:disable-next-line:only-arrow-functions
                binding.updateSource = function (value) {
                    this.standardUpdateSource(value);
                    this.validationController.validateBinding(this);
                };
            }
            // tslint:disable-next-line:no-bitwise
            if (trigger & validate_trigger_1.validateTrigger.blur) {
                binding.validateBlurHandler = function () {
                    _this.taskQueue.queueMicroTask(function () { return controller.validateBinding(binding); });
                };
                binding.validateTarget = target;
                target.addEventListener('blur', binding.validateBlurHandler);
            }
            if (trigger !== validate_trigger_1.validateTrigger.manual) {
                binding.standardUpdateTarget = binding.updateTarget;
                // tslint:disable-next-line:only-arrow-functions
                binding.updateTarget = function (value) {
                    this.standardUpdateTarget(value);
                    this.validationController.resetBinding(this);
                };
            }
        };
        ValidateBindingBehaviorBase.prototype.unbind = function (binding) {
            // reset the binding to it's original state.
            if (binding.standardUpdateSource) {
                binding.updateSource = binding.standardUpdateSource;
                binding.standardUpdateSource = null;
            }
            if (binding.standardUpdateTarget) {
                binding.updateTarget = binding.standardUpdateTarget;
                binding.standardUpdateTarget = null;
            }
            if (binding.validateBlurHandler) {
                binding.validateTarget.removeEventListener('blur', binding.validateBlurHandler);
                binding.validateBlurHandler = null;
                binding.validateTarget = null;
            }
            binding.validationController.unregisterBinding(binding);
            binding.validationController = null;
        };
        return ValidateBindingBehaviorBase;
    }());
    exports.ValidateBindingBehaviorBase = ValidateBindingBehaviorBase;
});

define('aurelia-validation/validation-controller',["require", "exports", "./validator", "./validate-trigger", "./property-info", "./validate-result"], function (require, exports, validator_1, validate_trigger_1, property_info_1, validate_result_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Orchestrates validation.
     * Manages a set of bindings, renderers and objects.
     * Exposes the current list of validation results for binding purposes.
     */
    var ValidationController = (function () {
        function ValidationController(validator) {
            this.validator = validator;
            // Registered bindings (via the validate binding behavior)
            this.bindings = new Map();
            // Renderers that have been added to the controller instance.
            this.renderers = [];
            /**
             * Validation results that have been rendered by the controller.
             */
            this.results = [];
            /**
             * Validation errors that have been rendered by the controller.
             */
            this.errors = [];
            /**
             *  Whether the controller is currently validating.
             */
            this.validating = false;
            // Elements related to validation results that have been rendered.
            this.elements = new Map();
            // Objects that have been added to the controller instance (entity-style validation).
            this.objects = new Map();
            /**
             * The trigger that will invoke automatic validation of a property used in a binding.
             */
            this.validateTrigger = validate_trigger_1.validateTrigger.blur;
            // Promise that resolves when validation has completed.
            this.finishValidating = Promise.resolve();
        }
        /**
         * Adds an object to the set of objects that should be validated when validate is called.
         * @param object The object.
         * @param rules Optional. The rules. If rules aren't supplied the Validator implementation will lookup the rules.
         */
        ValidationController.prototype.addObject = function (object, rules) {
            this.objects.set(object, rules);
        };
        /**
         * Removes an object from the set of objects that should be validated when validate is called.
         * @param object The object.
         */
        ValidationController.prototype.removeObject = function (object) {
            this.objects.delete(object);
            this.processResultDelta('reset', this.results.filter(function (result) { return result.object === object; }), []);
        };
        /**
         * Adds and renders an error.
         */
        ValidationController.prototype.addError = function (message, object, propertyName) {
            if (propertyName === void 0) { propertyName = null; }
            var result = new validate_result_1.ValidateResult({}, object, propertyName, false, message);
            this.processResultDelta('validate', [], [result]);
            return result;
        };
        /**
         * Removes and unrenders an error.
         */
        ValidationController.prototype.removeError = function (result) {
            if (this.results.indexOf(result) !== -1) {
                this.processResultDelta('reset', [result], []);
            }
        };
        /**
         * Adds a renderer.
         * @param renderer The renderer.
         */
        ValidationController.prototype.addRenderer = function (renderer) {
            var _this = this;
            this.renderers.push(renderer);
            renderer.render({
                kind: 'validate',
                render: this.results.map(function (result) { return ({ result: result, elements: _this.elements.get(result) }); }),
                unrender: []
            });
        };
        /**
         * Removes a renderer.
         * @param renderer The renderer.
         */
        ValidationController.prototype.removeRenderer = function (renderer) {
            var _this = this;
            this.renderers.splice(this.renderers.indexOf(renderer), 1);
            renderer.render({
                kind: 'reset',
                render: [],
                unrender: this.results.map(function (result) { return ({ result: result, elements: _this.elements.get(result) }); })
            });
        };
        /**
         * Registers a binding with the controller.
         * @param binding The binding instance.
         * @param target The DOM element.
         * @param rules (optional) rules associated with the binding. Validator implementation specific.
         */
        ValidationController.prototype.registerBinding = function (binding, target, rules) {
            this.bindings.set(binding, { target: target, rules: rules, propertyInfo: null });
        };
        /**
         * Unregisters a binding with the controller.
         * @param binding The binding instance.
         */
        ValidationController.prototype.unregisterBinding = function (binding) {
            this.resetBinding(binding);
            this.bindings.delete(binding);
        };
        /**
         * Interprets the instruction and returns a predicate that will identify
         * relevant results in the list of rendered validation results.
         */
        ValidationController.prototype.getInstructionPredicate = function (instruction) {
            var _this = this;
            if (instruction) {
                var object_1 = instruction.object, propertyName_1 = instruction.propertyName, rules_1 = instruction.rules;
                var predicate_1;
                if (instruction.propertyName) {
                    predicate_1 = function (x) { return x.object === object_1 && x.propertyName === propertyName_1; };
                }
                else {
                    predicate_1 = function (x) { return x.object === object_1; };
                }
                if (rules_1) {
                    return function (x) { return predicate_1(x) && _this.validator.ruleExists(rules_1, x.rule); };
                }
                return predicate_1;
            }
            else {
                return function () { return true; };
            }
        };
        /**
         * Validates and renders results.
         * @param instruction Optional. Instructions on what to validate. If undefined, all
         * objects and bindings will be validated.
         */
        ValidationController.prototype.validate = function (instruction) {
            var _this = this;
            // Get a function that will process the validation instruction.
            var execute;
            if (instruction) {
                // tslint:disable-next-line:prefer-const
                var object_2 = instruction.object, propertyName_2 = instruction.propertyName, rules_2 = instruction.rules;
                // if rules were not specified, check the object map.
                rules_2 = rules_2 || this.objects.get(object_2);
                // property specified?
                if (instruction.propertyName === undefined) {
                    // validate the specified object.
                    execute = function () { return _this.validator.validateObject(object_2, rules_2); };
                }
                else {
                    // validate the specified property.
                    execute = function () { return _this.validator.validateProperty(object_2, propertyName_2, rules_2); };
                }
            }
            else {
                // validate all objects and bindings.
                execute = function () {
                    var promises = [];
                    for (var _i = 0, _a = Array.from(_this.objects); _i < _a.length; _i++) {
                        var _b = _a[_i], object = _b[0], rules = _b[1];
                        promises.push(_this.validator.validateObject(object, rules));
                    }
                    for (var _c = 0, _d = Array.from(_this.bindings); _c < _d.length; _c++) {
                        var _e = _d[_c], binding = _e[0], rules = _e[1].rules;
                        var propertyInfo = property_info_1.getPropertyInfo(binding.sourceExpression, binding.source);
                        if (!propertyInfo || _this.objects.has(propertyInfo.object)) {
                            continue;
                        }
                        promises.push(_this.validator.validateProperty(propertyInfo.object, propertyInfo.propertyName, rules));
                    }
                    return Promise.all(promises).then(function (resultSets) { return resultSets.reduce(function (a, b) { return a.concat(b); }, []); });
                };
            }
            // Wait for any existing validation to finish, execute the instruction, render the results.
            this.validating = true;
            var returnPromise = this.finishValidating
                .then(execute)
                .then(function (newResults) {
                var predicate = _this.getInstructionPredicate(instruction);
                var oldResults = _this.results.filter(predicate);
                _this.processResultDelta('validate', oldResults, newResults);
                if (returnPromise === _this.finishValidating) {
                    _this.validating = false;
                }
                var result = {
                    instruction: instruction,
                    valid: newResults.find(function (x) { return !x.valid; }) === undefined,
                    results: newResults
                };
                return result;
            })
                .catch(function (exception) {
                // recover, to enable subsequent calls to validate()
                _this.validating = false;
                _this.finishValidating = Promise.resolve();
                return Promise.reject(exception);
            });
            this.finishValidating = returnPromise;
            return returnPromise;
        };
        /**
         * Resets any rendered validation results (unrenders).
         * @param instruction Optional. Instructions on what to reset. If unspecified all rendered results
         * will be unrendered.
         */
        ValidationController.prototype.reset = function (instruction) {
            var predicate = this.getInstructionPredicate(instruction);
            var oldResults = this.results.filter(predicate);
            this.processResultDelta('reset', oldResults, []);
        };
        /**
         * Gets the elements associated with an object and propertyName (if any).
         */
        ValidationController.prototype.getAssociatedElements = function (_a) {
            var object = _a.object, propertyName = _a.propertyName;
            var elements = [];
            for (var _i = 0, _b = Array.from(this.bindings); _i < _b.length; _i++) {
                var _c = _b[_i], binding = _c[0], target = _c[1].target;
                var propertyInfo = property_info_1.getPropertyInfo(binding.sourceExpression, binding.source);
                if (propertyInfo && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
                    elements.push(target);
                }
            }
            return elements;
        };
        ValidationController.prototype.processResultDelta = function (kind, oldResults, newResults) {
            // prepare the instruction.
            var instruction = {
                kind: kind,
                render: [],
                unrender: []
            };
            // create a shallow copy of newResults so we can mutate it without causing side-effects.
            newResults = newResults.slice(0);
            var _loop_1 = function (oldResult) {
                // get the elements associated with the old result.
                var elements = this_1.elements.get(oldResult);
                // remove the old result from the element map.
                this_1.elements.delete(oldResult);
                // create the unrender instruction.
                instruction.unrender.push({ result: oldResult, elements: elements });
                // determine if there's a corresponding new result for the old result we are unrendering.
                var newResultIndex = newResults.findIndex(function (x) { return x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName; });
                if (newResultIndex === -1) {
                    // no corresponding new result... simple remove.
                    this_1.results.splice(this_1.results.indexOf(oldResult), 1);
                    if (!oldResult.valid) {
                        this_1.errors.splice(this_1.errors.indexOf(oldResult), 1);
                    }
                }
                else {
                    // there is a corresponding new result...
                    var newResult = newResults.splice(newResultIndex, 1)[0];
                    // get the elements that are associated with the new result.
                    var elements_1 = this_1.getAssociatedElements(newResult);
                    this_1.elements.set(newResult, elements_1);
                    // create a render instruction for the new result.
                    instruction.render.push({ result: newResult, elements: elements_1 });
                    // do an in-place replacement of the old result with the new result.
                    // this ensures any repeats bound to this.results will not thrash.
                    this_1.results.splice(this_1.results.indexOf(oldResult), 1, newResult);
                    if (!oldResult.valid && newResult.valid) {
                        this_1.errors.splice(this_1.errors.indexOf(oldResult), 1);
                    }
                    else if (!oldResult.valid && !newResult.valid) {
                        this_1.errors.splice(this_1.errors.indexOf(oldResult), 1, newResult);
                    }
                    else if (!newResult.valid) {
                        this_1.errors.push(newResult);
                    }
                }
            };
            var this_1 = this;
            // create unrender instructions from the old results.
            for (var _i = 0, oldResults_1 = oldResults; _i < oldResults_1.length; _i++) {
                var oldResult = oldResults_1[_i];
                _loop_1(oldResult);
            }
            // create render instructions from the remaining new results.
            for (var _a = 0, newResults_1 = newResults; _a < newResults_1.length; _a++) {
                var result = newResults_1[_a];
                var elements = this.getAssociatedElements(result);
                instruction.render.push({ result: result, elements: elements });
                this.elements.set(result, elements);
                this.results.push(result);
                if (!result.valid) {
                    this.errors.push(result);
                }
            }
            // render.
            for (var _b = 0, _c = this.renderers; _b < _c.length; _b++) {
                var renderer = _c[_b];
                renderer.render(instruction);
            }
        };
        /**
         * Validates the property associated with a binding.
         */
        ValidationController.prototype.validateBinding = function (binding) {
            if (!binding.isBound) {
                return;
            }
            var propertyInfo = property_info_1.getPropertyInfo(binding.sourceExpression, binding.source);
            var rules;
            var registeredBinding = this.bindings.get(binding);
            if (registeredBinding) {
                rules = registeredBinding.rules;
                registeredBinding.propertyInfo = propertyInfo;
            }
            if (!propertyInfo) {
                return;
            }
            var object = propertyInfo.object, propertyName = propertyInfo.propertyName;
            this.validate({ object: object, propertyName: propertyName, rules: rules });
        };
        /**
         * Resets the results for a property associated with a binding.
         */
        ValidationController.prototype.resetBinding = function (binding) {
            var registeredBinding = this.bindings.get(binding);
            var propertyInfo = property_info_1.getPropertyInfo(binding.sourceExpression, binding.source);
            if (!propertyInfo && registeredBinding) {
                propertyInfo = registeredBinding.propertyInfo;
            }
            if (registeredBinding) {
                registeredBinding.propertyInfo = null;
            }
            if (!propertyInfo) {
                return;
            }
            var object = propertyInfo.object, propertyName = propertyInfo.propertyName;
            this.reset({ object: object, propertyName: propertyName });
        };
        return ValidationController;
    }());
    ValidationController.inject = [validator_1.Validator];
    exports.ValidationController = ValidationController;
});

define('aurelia-validation/validator',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Validates objects and properties.
     */
    var Validator = (function () {
        function Validator() {
        }
        return Validator;
    }());
    exports.Validator = Validator;
});

define('aurelia-validation/validate-result',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The result of validating an individual validation rule.
     */
    var ValidateResult = (function () {
        /**
         * @param rule The rule associated with the result. Validator implementation specific.
         * @param object The object that was validated.
         * @param propertyName The name of the property that was validated.
         * @param error The error, if the result is a validation error.
         */
        function ValidateResult(rule, object, propertyName, valid, message) {
            if (message === void 0) { message = null; }
            this.rule = rule;
            this.object = object;
            this.propertyName = propertyName;
            this.valid = valid;
            this.message = message;
            this.id = ValidateResult.nextId++;
        }
        ValidateResult.prototype.toString = function () {
            return this.valid ? 'Valid.' : this.message;
        };
        return ValidateResult;
    }());
    ValidateResult.nextId = 0;
    exports.ValidateResult = ValidateResult;
});

define('aurelia-validation/validation-controller-factory',["require", "exports", "./validation-controller", "./validator"], function (require, exports, validation_controller_1, validator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates ValidationController instances.
     */
    var ValidationControllerFactory = (function () {
        function ValidationControllerFactory(container) {
            this.container = container;
        }
        ValidationControllerFactory.get = function (container) {
            return new ValidationControllerFactory(container);
        };
        /**
         * Creates a new controller instance.
         */
        ValidationControllerFactory.prototype.create = function (validator) {
            if (!validator) {
                validator = this.container.get(validator_1.Validator);
            }
            return new validation_controller_1.ValidationController(validator);
        };
        /**
         * Creates a new controller and registers it in the current element's container so that it's
         * available to the validate binding behavior and renderers.
         */
        ValidationControllerFactory.prototype.createForCurrentScope = function (validator) {
            var controller = this.create(validator);
            this.container.registerInstance(validation_controller_1.ValidationController, controller);
            return controller;
        };
        return ValidationControllerFactory;
    }());
    exports.ValidationControllerFactory = ValidationControllerFactory;
    ValidationControllerFactory['protocol:aurelia:resolver'] = true;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-validation/validation-errors-custom-attribute',["require", "exports", "aurelia-binding", "aurelia-dependency-injection", "aurelia-templating", "./validation-controller", "aurelia-pal"], function (require, exports, aurelia_binding_1, aurelia_dependency_injection_1, aurelia_templating_1, validation_controller_1, aurelia_pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationErrorsCustomAttribute = (function () {
        function ValidationErrorsCustomAttribute(boundaryElement, controllerAccessor) {
            this.boundaryElement = boundaryElement;
            this.controllerAccessor = controllerAccessor;
            this.controller = null;
            this.errors = [];
            this.errorsInternal = [];
        }
        ValidationErrorsCustomAttribute.prototype.sort = function () {
            this.errorsInternal.sort(function (a, b) {
                if (a.targets[0] === b.targets[0]) {
                    return 0;
                }
                // tslint:disable-next-line:no-bitwise
                return a.targets[0].compareDocumentPosition(b.targets[0]) & 2 ? 1 : -1;
            });
        };
        ValidationErrorsCustomAttribute.prototype.interestingElements = function (elements) {
            var _this = this;
            return elements.filter(function (e) { return _this.boundaryElement.contains(e); });
        };
        ValidationErrorsCustomAttribute.prototype.render = function (instruction) {
            var _loop_1 = function (result) {
                var index = this_1.errorsInternal.findIndex(function (x) { return x.error === result; });
                if (index !== -1) {
                    this_1.errorsInternal.splice(index, 1);
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = instruction.unrender; _i < _a.length; _i++) {
                var result = _a[_i].result;
                _loop_1(result);
            }
            for (var _b = 0, _c = instruction.render; _b < _c.length; _b++) {
                var _d = _c[_b], result = _d.result, elements = _d.elements;
                if (result.valid) {
                    continue;
                }
                var targets = this.interestingElements(elements);
                if (targets.length) {
                    this.errorsInternal.push({ error: result, targets: targets });
                }
            }
            this.sort();
            this.errors = this.errorsInternal;
        };
        ValidationErrorsCustomAttribute.prototype.bind = function () {
            if (!this.controller) {
                this.controller = this.controllerAccessor();
            }
            // this will call render() with the side-effect of updating this.errors
            this.controller.addRenderer(this);
        };
        ValidationErrorsCustomAttribute.prototype.unbind = function () {
            if (this.controller) {
                this.controller.removeRenderer(this);
            }
        };
        return ValidationErrorsCustomAttribute;
    }());
    ValidationErrorsCustomAttribute.inject = [aurelia_pal_1.DOM.Element, aurelia_dependency_injection_1.Lazy.of(validation_controller_1.ValidationController)];
    __decorate([
        aurelia_templating_1.bindable({ defaultBindingMode: aurelia_binding_1.bindingMode.oneWay })
    ], ValidationErrorsCustomAttribute.prototype, "controller", void 0);
    __decorate([
        aurelia_templating_1.bindable({ primaryProperty: true, defaultBindingMode: aurelia_binding_1.bindingMode.twoWay })
    ], ValidationErrorsCustomAttribute.prototype, "errors", void 0);
    ValidationErrorsCustomAttribute = __decorate([
        aurelia_templating_1.customAttribute('validation-errors')
    ], ValidationErrorsCustomAttribute);
    exports.ValidationErrorsCustomAttribute = ValidationErrorsCustomAttribute;
});

define('aurelia-validation/validation-renderer-custom-attribute',["require", "exports", "./validation-controller"], function (require, exports, validation_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationRendererCustomAttribute = (function () {
        function ValidationRendererCustomAttribute() {
        }
        ValidationRendererCustomAttribute.prototype.created = function (view) {
            this.container = view.container;
        };
        ValidationRendererCustomAttribute.prototype.bind = function () {
            this.controller = this.container.get(validation_controller_1.ValidationController);
            this.renderer = this.container.get(this.value);
            this.controller.addRenderer(this.renderer);
        };
        ValidationRendererCustomAttribute.prototype.unbind = function () {
            this.controller.removeRenderer(this.renderer);
            this.controller = null;
            this.renderer = null;
        };
        return ValidationRendererCustomAttribute;
    }());
    exports.ValidationRendererCustomAttribute = ValidationRendererCustomAttribute;
});

define('aurelia-validation/implementation/rules',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Sets, unsets and retrieves rules on an object or constructor function.
     */
    var Rules = (function () {
        function Rules() {
        }
        /**
         * Applies the rules to a target.
         */
        Rules.set = function (target, rules) {
            if (target instanceof Function) {
                target = target.prototype;
            }
            Object.defineProperty(target, Rules.key, { enumerable: false, configurable: false, writable: true, value: rules });
        };
        /**
         * Removes rules from a target.
         */
        Rules.unset = function (target) {
            if (target instanceof Function) {
                target = target.prototype;
            }
            target[Rules.key] = null;
        };
        /**
         * Retrieves the target's rules.
         */
        Rules.get = function (target) {
            return target[Rules.key] || null;
        };
        return Rules;
    }());
    /**
     * The name of the property that stores the rules.
     */
    Rules.key = '__rules__';
    exports.Rules = Rules;
});

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('aurelia-validation/implementation/standard-validator',["require", "exports", "aurelia-templating", "../validator", "../validate-result", "./rules", "./validation-messages"], function (require, exports, aurelia_templating_1, validator_1, validate_result_1, rules_1, validation_messages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Validates.
     * Responsible for validating objects and properties.
     */
    var StandardValidator = (function (_super) {
        __extends(StandardValidator, _super);
        function StandardValidator(messageProvider, resources) {
            var _this = _super.call(this) || this;
            _this.messageProvider = messageProvider;
            _this.lookupFunctions = resources.lookupFunctions;
            _this.getDisplayName = messageProvider.getDisplayName.bind(messageProvider);
            return _this;
        }
        /**
         * Validates the specified property.
         * @param object The object to validate.
         * @param propertyName The name of the property to validate.
         * @param rules Optional. If unspecified, the rules will be looked up using the metadata
         * for the object created by ValidationRules....on(class/object)
         */
        StandardValidator.prototype.validateProperty = function (object, propertyName, rules) {
            return this.validate(object, propertyName, rules || null);
        };
        /**
         * Validates all rules for specified object and it's properties.
         * @param object The object to validate.
         * @param rules Optional. If unspecified, the rules will be looked up using the metadata
         * for the object created by ValidationRules....on(class/object)
         */
        StandardValidator.prototype.validateObject = function (object, rules) {
            return this.validate(object, null, rules || null);
        };
        /**
         * Determines whether a rule exists in a set of rules.
         * @param rules The rules to search.
         * @parem rule The rule to find.
         */
        StandardValidator.prototype.ruleExists = function (rules, rule) {
            var i = rules.length;
            while (i--) {
                if (rules[i].indexOf(rule) !== -1) {
                    return true;
                }
            }
            return false;
        };
        StandardValidator.prototype.getMessage = function (rule, object, value) {
            var expression = rule.message || this.messageProvider.getMessage(rule.messageKey);
            // tslint:disable-next-line:prefer-const
            var _a = rule.property, propertyName = _a.name, displayName = _a.displayName;
            if (propertyName !== null) {
                displayName = this.messageProvider.getDisplayName(propertyName, displayName);
            }
            var overrideContext = {
                $displayName: displayName,
                $propertyName: propertyName,
                $value: value,
                $object: object,
                $config: rule.config,
                // returns the name of a given property, given just the property name (irrespective of the property's displayName)
                // split on capital letters, first letter ensured to be capitalized
                $getDisplayName: this.getDisplayName
            };
            return expression.evaluate({ bindingContext: object, overrideContext: overrideContext }, this.lookupFunctions);
        };
        StandardValidator.prototype.validateRuleSequence = function (object, propertyName, ruleSequence, sequence, results) {
            var _this = this;
            // are we validating all properties or a single property?
            var validateAllProperties = propertyName === null || propertyName === undefined;
            var rules = ruleSequence[sequence];
            var allValid = true;
            // validate each rule.
            var promises = [];
            var _loop_1 = function (i) {
                var rule = rules[i];
                // is the rule related to the property we're validating.
                if (!validateAllProperties && rule.property.name !== propertyName) {
                    return "continue";
                }
                // is this a conditional rule? is the condition met?
                if (rule.when && !rule.when(object)) {
                    return "continue";
                }
                // validate.
                var value = rule.property.name === null ? object : object[rule.property.name];
                var promiseOrBoolean = rule.condition(value, object);
                if (!(promiseOrBoolean instanceof Promise)) {
                    promiseOrBoolean = Promise.resolve(promiseOrBoolean);
                }
                promises.push(promiseOrBoolean.then(function (valid) {
                    var message = valid ? null : _this.getMessage(rule, object, value);
                    results.push(new validate_result_1.ValidateResult(rule, object, rule.property.name, valid, message));
                    allValid = allValid && valid;
                    return valid;
                }));
            };
            for (var i = 0; i < rules.length; i++) {
                _loop_1(i);
            }
            return Promise.all(promises)
                .then(function () {
                sequence++;
                if (allValid && sequence < ruleSequence.length) {
                    return _this.validateRuleSequence(object, propertyName, ruleSequence, sequence, results);
                }
                return results;
            });
        };
        StandardValidator.prototype.validate = function (object, propertyName, rules) {
            // rules specified?
            if (!rules) {
                // no. attempt to locate the rules.
                rules = rules_1.Rules.get(object);
            }
            // any rules?
            if (!rules) {
                return Promise.resolve([]);
            }
            return this.validateRuleSequence(object, propertyName, rules, 0, []);
        };
        return StandardValidator;
    }(validator_1.Validator));
    StandardValidator.inject = [validation_messages_1.ValidationMessageProvider, aurelia_templating_1.ViewResources];
    exports.StandardValidator = StandardValidator;
});

define('aurelia-validation/implementation/validation-messages',["require", "exports", "./validation-parser"], function (require, exports, validation_parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dictionary of validation messages. [messageKey]: messageExpression
     */
    exports.validationMessages = {
        /**
         * The default validation message. Used with rules that have no standard message.
         */
        default: "${$displayName} is invalid.",
        required: "${$displayName} is required.",
        matches: "${$displayName} is not correctly formatted.",
        email: "${$displayName} is not a valid email.",
        minLength: "${$displayName} must be at least ${$config.length} character${$config.length === 1 ? '' : 's'}.",
        maxLength: "${$displayName} cannot be longer than ${$config.length} character${$config.length === 1 ? '' : 's'}.",
        minItems: "${$displayName} must contain at least ${$config.count} item${$config.count === 1 ? '' : 's'}.",
        maxItems: "${$displayName} cannot contain more than ${$config.count} item${$config.count === 1 ? '' : 's'}.",
        equals: "${$displayName} must be ${$config.expectedValue}.",
    };
    /**
     * Retrieves validation messages and property display names.
     */
    var ValidationMessageProvider = (function () {
        function ValidationMessageProvider(parser) {
            this.parser = parser;
        }
        /**
         * Returns a message binding expression that corresponds to the key.
         * @param key The message key.
         */
        ValidationMessageProvider.prototype.getMessage = function (key) {
            var message;
            if (key in exports.validationMessages) {
                message = exports.validationMessages[key];
            }
            else {
                message = exports.validationMessages['default'];
            }
            return this.parser.parseMessage(message);
        };
        /**
         * Formulates a property display name using the property name and the configured
         * displayName (if provided).
         * Override this with your own custom logic.
         * @param propertyName The property name.
         */
        ValidationMessageProvider.prototype.getDisplayName = function (propertyName, displayName) {
            if (displayName !== null && displayName !== undefined) {
                return (displayName instanceof Function) ? displayName() : displayName;
            }
            // split on upper-case letters.
            var words = propertyName.split(/(?=[A-Z])/).join(' ');
            // capitalize first letter.
            return words.charAt(0).toUpperCase() + words.slice(1);
        };
        return ValidationMessageProvider;
    }());
    ValidationMessageProvider.inject = [validation_parser_1.ValidationParser];
    exports.ValidationMessageProvider = ValidationMessageProvider;
});

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define('aurelia-validation/implementation/validation-parser',["require", "exports", "aurelia-binding", "aurelia-templating", "./util", "aurelia-logging"], function (require, exports, aurelia_binding_1, aurelia_templating_1, util_1, LogManager) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationParser = (function () {
        function ValidationParser(parser, bindinqLanguage) {
            this.parser = parser;
            this.bindinqLanguage = bindinqLanguage;
            this.emptyStringExpression = new aurelia_binding_1.LiteralString('');
            this.nullExpression = new aurelia_binding_1.LiteralPrimitive(null);
            this.undefinedExpression = new aurelia_binding_1.LiteralPrimitive(undefined);
            this.cache = {};
        }
        ValidationParser.prototype.parseMessage = function (message) {
            if (this.cache[message] !== undefined) {
                return this.cache[message];
            }
            var parts = this.bindinqLanguage.parseInterpolation(null, message);
            if (parts === null) {
                return new aurelia_binding_1.LiteralString(message);
            }
            var expression = new aurelia_binding_1.LiteralString(parts[0]);
            for (var i = 1; i < parts.length; i += 2) {
                expression = new aurelia_binding_1.Binary('+', expression, new aurelia_binding_1.Binary('+', this.coalesce(parts[i]), new aurelia_binding_1.LiteralString(parts[i + 1])));
            }
            MessageExpressionValidator.validate(expression, message);
            this.cache[message] = expression;
            return expression;
        };
        ValidationParser.prototype.parseProperty = function (property) {
            if (util_1.isString(property)) {
                return { name: property, displayName: null };
            }
            var accessor = this.getAccessorExpression(property.toString());
            if (accessor instanceof aurelia_binding_1.AccessScope
                || accessor instanceof aurelia_binding_1.AccessMember && accessor.object instanceof aurelia_binding_1.AccessScope) {
                return {
                    name: accessor.name,
                    displayName: null
                };
            }
            throw new Error("Invalid subject: \"" + accessor + "\"");
        };
        ValidationParser.prototype.coalesce = function (part) {
            // part === null || part === undefined ? '' : part
            return new aurelia_binding_1.Conditional(new aurelia_binding_1.Binary('||', new aurelia_binding_1.Binary('===', part, this.nullExpression), new aurelia_binding_1.Binary('===', part, this.undefinedExpression)), this.emptyStringExpression, new aurelia_binding_1.CallMember(part, 'toString', []));
        };
        ValidationParser.prototype.getAccessorExpression = function (fn) {
            /* tslint:disable:max-line-length */
            var classic = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*"use strict";)?\s*(?:[$_\w\d.['"\]+;]+)?\s*return\s+[$_\w\d]+\.([$_\w\d]+)\s*;?\s*\}$/;
            /* tslint:enable:max-line-length */
            var arrow = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+\.([$_\w\d]+)$/;
            var match = classic.exec(fn) || arrow.exec(fn);
            if (match === null) {
                throw new Error("Unable to parse accessor function:\n" + fn);
            }
            return this.parser.parse(match[1]);
        };
        return ValidationParser;
    }());
    ValidationParser.inject = [aurelia_binding_1.Parser, aurelia_templating_1.BindingLanguage];
    exports.ValidationParser = ValidationParser;
    var MessageExpressionValidator = (function (_super) {
        __extends(MessageExpressionValidator, _super);
        function MessageExpressionValidator(originalMessage) {
            var _this = _super.call(this, []) || this;
            _this.originalMessage = originalMessage;
            return _this;
        }
        MessageExpressionValidator.validate = function (expression, originalMessage) {
            var visitor = new MessageExpressionValidator(originalMessage);
            expression.accept(visitor);
        };
        MessageExpressionValidator.prototype.visitAccessScope = function (access) {
            if (access.ancestor !== 0) {
                throw new Error('$parent is not permitted in validation message expressions.');
            }
            if (['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'].indexOf(access.name) !== -1) {
                LogManager.getLogger('aurelia-validation')
                    .warn("Did you mean to use \"$" + access.name + "\" instead of \"" + access.name + "\" in this validation message template: \"" + this.originalMessage + "\"?");
            }
        };
        return MessageExpressionValidator;
    }(aurelia_binding_1.Unparser));
    exports.MessageExpressionValidator = MessageExpressionValidator;
});

define('aurelia-validation/implementation/util',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    }
    exports.isString = isString;
});

define('aurelia-validation/implementation/validation-rules',["require", "exports", "./util", "./rules", "./validation-messages"], function (require, exports, util_1, rules_1, validation_messages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Part of the fluent rule API. Enables customizing property rules.
     */
    var FluentRuleCustomizer = (function () {
        function FluentRuleCustomizer(property, condition, config, fluentEnsure, fluentRules, parser) {
            if (config === void 0) { config = {}; }
            this.fluentEnsure = fluentEnsure;
            this.fluentRules = fluentRules;
            this.parser = parser;
            this.rule = {
                property: property,
                condition: condition,
                config: config,
                when: null,
                messageKey: 'default',
                message: null,
                sequence: fluentRules.sequence
            };
            this.fluentEnsure._addRule(this.rule);
        }
        /**
         * Validate subsequent rules after previously declared rules have
         * been validated successfully. Use to postpone validation of costly
         * rules until less expensive rules pass validation.
         */
        FluentRuleCustomizer.prototype.then = function () {
            this.fluentRules.sequence++;
            return this;
        };
        /**
         * Specifies the key to use when looking up the rule's validation message.
         */
        FluentRuleCustomizer.prototype.withMessageKey = function (key) {
            this.rule.messageKey = key;
            this.rule.message = null;
            return this;
        };
        /**
         * Specifies rule's validation message.
         */
        FluentRuleCustomizer.prototype.withMessage = function (message) {
            this.rule.messageKey = 'custom';
            this.rule.message = this.parser.parseMessage(message);
            return this;
        };
        /**
         * Specifies a condition that must be met before attempting to validate the rule.
         * @param condition A function that accepts the object as a parameter and returns true
         * or false whether the rule should be evaluated.
         */
        FluentRuleCustomizer.prototype.when = function (condition) {
            this.rule.when = condition;
            return this;
        };
        /**
         * Tags the rule instance, enabling the rule to be found easily
         * using ValidationRules.taggedRules(rules, tag)
         */
        FluentRuleCustomizer.prototype.tag = function (tag) {
            this.rule.tag = tag;
            return this;
        };
        ///// FluentEnsure APIs /////
        /**
         * Target a property with validation rules.
         * @param property The property to target. Can be the property name or a property accessor function.
         */
        FluentRuleCustomizer.prototype.ensure = function (subject) {
            return this.fluentEnsure.ensure(subject);
        };
        /**
         * Targets an object with validation rules.
         */
        FluentRuleCustomizer.prototype.ensureObject = function () {
            return this.fluentEnsure.ensureObject();
        };
        Object.defineProperty(FluentRuleCustomizer.prototype, "rules", {
            /**
             * Rules that have been defined using the fluent API.
             */
            get: function () {
                return this.fluentEnsure.rules;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Applies the rules to a class or object, making them discoverable by the StandardValidator.
         * @param target A class or object.
         */
        FluentRuleCustomizer.prototype.on = function (target) {
            return this.fluentEnsure.on(target);
        };
        ///////// FluentRules APIs /////////
        /**
         * Applies an ad-hoc rule function to the ensured property or object.
         * @param condition The function to validate the rule.
         * Will be called with two arguments, the property value and the object.
         * Should return a boolean or a Promise that resolves to a boolean.
         */
        FluentRuleCustomizer.prototype.satisfies = function (condition, config) {
            return this.fluentRules.satisfies(condition, config);
        };
        /**
         * Applies a rule by name.
         * @param name The name of the custom or standard rule.
         * @param args The rule's arguments.
         */
        FluentRuleCustomizer.prototype.satisfiesRule = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return (_a = this.fluentRules).satisfiesRule.apply(_a, [name].concat(args));
            var _a;
        };
        /**
         * Applies the "required" rule to the property.
         * The value cannot be null, undefined or whitespace.
         */
        FluentRuleCustomizer.prototype.required = function () {
            return this.fluentRules.required();
        };
        /**
         * Applies the "matches" rule to the property.
         * Value must match the specified regular expression.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRuleCustomizer.prototype.matches = function (regex) {
            return this.fluentRules.matches(regex);
        };
        /**
         * Applies the "email" rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRuleCustomizer.prototype.email = function () {
            return this.fluentRules.email();
        };
        /**
         * Applies the "minLength" STRING validation rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRuleCustomizer.prototype.minLength = function (length) {
            return this.fluentRules.minLength(length);
        };
        /**
         * Applies the "maxLength" STRING validation rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRuleCustomizer.prototype.maxLength = function (length) {
            return this.fluentRules.maxLength(length);
        };
        /**
         * Applies the "minItems" ARRAY validation rule to the property.
         * null and undefined values are considered valid.
         */
        FluentRuleCustomizer.prototype.minItems = function (count) {
            return this.fluentRules.minItems(count);
        };
        /**
         * Applies the "maxItems" ARRAY validation rule to the property.
         * null and undefined values are considered valid.
         */
        FluentRuleCustomizer.prototype.maxItems = function (count) {
            return this.fluentRules.maxItems(count);
        };
        /**
         * Applies the "equals" validation rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRuleCustomizer.prototype.equals = function (expectedValue) {
            return this.fluentRules.equals(expectedValue);
        };
        return FluentRuleCustomizer;
    }());
    exports.FluentRuleCustomizer = FluentRuleCustomizer;
    /**
     * Part of the fluent rule API. Enables applying rules to properties and objects.
     */
    var FluentRules = (function () {
        function FluentRules(fluentEnsure, parser, property) {
            this.fluentEnsure = fluentEnsure;
            this.parser = parser;
            this.property = property;
            /**
             * Current rule sequence number. Used to postpone evaluation of rules until rules
             * with lower sequence number have successfully validated. The "then" fluent API method
             * manages this property, there's usually no need to set it directly.
             */
            this.sequence = 0;
        }
        /**
         * Sets the display name of the ensured property.
         */
        FluentRules.prototype.displayName = function (name) {
            this.property.displayName = name;
            return this;
        };
        /**
         * Applies an ad-hoc rule function to the ensured property or object.
         * @param condition The function to validate the rule.
         * Will be called with two arguments, the property value and the object.
         * Should return a boolean or a Promise that resolves to a boolean.
         */
        FluentRules.prototype.satisfies = function (condition, config) {
            return new FluentRuleCustomizer(this.property, condition, config, this.fluentEnsure, this, this.parser);
        };
        /**
         * Applies a rule by name.
         * @param name The name of the custom or standard rule.
         * @param args The rule's arguments.
         */
        FluentRules.prototype.satisfiesRule = function (name) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var rule = FluentRules.customRules[name];
            if (!rule) {
                // standard rule?
                rule = this[name];
                if (rule instanceof Function) {
                    return rule.call.apply(rule, [this].concat(args));
                }
                throw new Error("Rule with name \"" + name + "\" does not exist.");
            }
            var config = rule.argsToConfig ? rule.argsToConfig.apply(rule, args) : undefined;
            return this.satisfies(function (value, obj) {
                return (_a = rule.condition).call.apply(_a, [_this, value, obj].concat(args));
                var _a;
            }, config)
                .withMessageKey(name);
        };
        /**
         * Applies the "required" rule to the property.
         * The value cannot be null, undefined or whitespace.
         */
        FluentRules.prototype.required = function () {
            return this.satisfies(function (value) {
                return value !== null
                    && value !== undefined
                    && !(util_1.isString(value) && !/\S/.test(value));
            }).withMessageKey('required');
        };
        /**
         * Applies the "matches" rule to the property.
         * Value must match the specified regular expression.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRules.prototype.matches = function (regex) {
            return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || regex.test(value); })
                .withMessageKey('matches');
        };
        /**
         * Applies the "email" rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRules.prototype.email = function () {
            // regex from https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
            /* tslint:disable:max-line-length */
            return this.matches(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
                .withMessageKey('email');
        };
        /**
         * Applies the "minLength" STRING validation rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRules.prototype.minLength = function (length) {
            return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || value.length >= length; }, { length: length })
                .withMessageKey('minLength');
        };
        /**
         * Applies the "maxLength" STRING validation rule to the property.
         * null, undefined and empty-string values are considered valid.
         */
        FluentRules.prototype.maxLength = function (length) {
            return this.satisfies(function (value) { return value === null || value === undefined || value.length === 0 || value.length <= length; }, { length: length })
                .withMessageKey('maxLength');
        };
        /**
         * Applies the "minItems" ARRAY validation rule to the property.
         * null and undefined values are considered valid.
         */
        FluentRules.prototype.minItems = function (count) {
            return this.satisfies(function (value) { return value === null || value === undefined || value.length >= count; }, { count: count })
                .withMessageKey('minItems');
        };
        /**
         * Applies the "maxItems" ARRAY validation rule to the property.
         * null and undefined values are considered valid.
         */
        FluentRules.prototype.maxItems = function (count) {
            return this.satisfies(function (value) { return value === null || value === undefined || value.length <= count; }, { count: count })
                .withMessageKey('maxItems');
        };
        /**
         * Applies the "equals" validation rule to the property.
         * null and undefined values are considered valid.
         */
        FluentRules.prototype.equals = function (expectedValue) {
            return this.satisfies(function (value) { return value === null || value === undefined || value === '' || value === expectedValue; }, { expectedValue: expectedValue })
                .withMessageKey('equals');
        };
        return FluentRules;
    }());
    FluentRules.customRules = {};
    exports.FluentRules = FluentRules;
    /**
     * Part of the fluent rule API. Enables targeting properties and objects with rules.
     */
    var FluentEnsure = (function () {
        function FluentEnsure(parser) {
            this.parser = parser;
            /**
             * Rules that have been defined using the fluent API.
             */
            this.rules = [];
        }
        /**
         * Target a property with validation rules.
         * @param property The property to target. Can be the property name or a property accessor
         * function.
         */
        FluentEnsure.prototype.ensure = function (property) {
            this.assertInitialized();
            return new FluentRules(this, this.parser, this.parser.parseProperty(property));
        };
        /**
         * Targets an object with validation rules.
         */
        FluentEnsure.prototype.ensureObject = function () {
            this.assertInitialized();
            return new FluentRules(this, this.parser, { name: null, displayName: null });
        };
        /**
         * Applies the rules to a class or object, making them discoverable by the StandardValidator.
         * @param target A class or object.
         */
        FluentEnsure.prototype.on = function (target) {
            rules_1.Rules.set(target, this.rules);
            return this;
        };
        /**
         * Adds a rule definition to the sequenced ruleset.
         * @internal
         */
        FluentEnsure.prototype._addRule = function (rule) {
            while (this.rules.length < rule.sequence + 1) {
                this.rules.push([]);
            }
            this.rules[rule.sequence].push(rule);
        };
        FluentEnsure.prototype.assertInitialized = function () {
            if (this.parser) {
                return;
            }
            throw new Error("Did you forget to add \".plugin('aurelia-validation')\" to your main.js?");
        };
        return FluentEnsure;
    }());
    exports.FluentEnsure = FluentEnsure;
    /**
     * Fluent rule definition API.
     */
    var ValidationRules = (function () {
        function ValidationRules() {
        }
        ValidationRules.initialize = function (parser) {
            ValidationRules.parser = parser;
        };
        /**
         * Target a property with validation rules.
         * @param property The property to target. Can be the property name or a property accessor function.
         */
        ValidationRules.ensure = function (property) {
            return new FluentEnsure(ValidationRules.parser).ensure(property);
        };
        /**
         * Targets an object with validation rules.
         */
        ValidationRules.ensureObject = function () {
            return new FluentEnsure(ValidationRules.parser).ensureObject();
        };
        /**
         * Defines a custom rule.
         * @param name The name of the custom rule. Also serves as the message key.
         * @param condition The rule function.
         * @param message The message expression
         * @param argsToConfig A function that maps the rule's arguments to a "config"
         * object that can be used when evaluating the message expression.
         */
        ValidationRules.customRule = function (name, condition, message, argsToConfig) {
            validation_messages_1.validationMessages[name] = message;
            FluentRules.customRules[name] = { condition: condition, argsToConfig: argsToConfig };
        };
        /**
         * Returns rules with the matching tag.
         * @param rules The rules to search.
         * @param tag The tag to search for.
         */
        ValidationRules.taggedRules = function (rules, tag) {
            return rules.map(function (x) { return x.filter(function (r) { return r.tag === tag; }); });
        };
        /**
         * Removes the rules from a class or object.
         * @param target A class or object.
         */
        ValidationRules.off = function (target) {
            rules_1.Rules.unset(target);
        };
        return ValidationRules;
    }());
    exports.ValidationRules = ValidationRules;
});

define('aurelia-i18n/i18n',['exports', 'i18next', 'aurelia-pal', 'aurelia-event-aggregator', 'aurelia-templating-resources'], function (exports, _i18next, _aureliaPal, _aureliaEventAggregator, _aureliaTemplatingResources) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.I18N = undefined;

  var _i18next2 = _interopRequireDefault(_i18next);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  

  var _class, _temp;

  var I18N = exports.I18N = (_temp = _class = function () {
    function I18N(ea, signaler) {
      var _this = this;

      

      this.globalVars = {};
      this.params = {};
      this.i18nextDefered = {
        resolve: null,
        promise: null
      };

      this.i18next = _i18next2.default;
      this.ea = ea;
      this.Intl = window.Intl;
      this.signaler = signaler;
      this.i18nextDefered.promise = new Promise(function (resolve) {
        return _this.i18nextDefered.resolve = resolve;
      });
    }

    I18N.prototype.setup = function setup(options) {
      var _this2 = this;

      var defaultOptions = {
        compatibilityAPI: 'v1',
        compatibilityJSON: 'v1',
        lng: 'en',
        attributes: ['t', 'i18n'],
        fallbackLng: 'en',
        debug: false
      };

      _i18next2.default.init(options || defaultOptions, function (err, t) {
        if (_i18next2.default.options.attributes instanceof String) {
          _i18next2.default.options.attributes = [_i18next2.default.options.attributes];
        }

        _this2.i18nextDefered.resolve(_this2.i18next);
      });

      return this.i18nextDefered.promise;
    };

    I18N.prototype.i18nextReady = function i18nextReady() {
      return this.i18nextDefered.promise;
    };

    I18N.prototype.setLocale = function setLocale(locale) {
      var _this3 = this;

      return new Promise(function (resolve) {
        var oldLocale = _this3.getLocale();
        _this3.i18next.changeLanguage(locale, function (err, tr) {
          _this3.ea.publish('i18n:locale:changed', { oldValue: oldLocale, newValue: locale });
          _this3.signaler.signal('aurelia-translation-signal');
          resolve(tr);
        });
      });
    };

    I18N.prototype.getLocale = function getLocale() {
      return this.i18next.language;
    };

    I18N.prototype.nf = function nf(options, locales) {
      return new this.Intl.NumberFormat(locales || this.getLocale(), options || {});
    };

    I18N.prototype.uf = function uf(number, locale) {
      var nf = this.nf({}, locale || this.getLocale());
      var comparer = nf.format(10000 / 3);

      var thousandSeparator = comparer[1];
      var decimalSeparator = comparer[5];

      var result = number.replace(thousandSeparator, '').replace(/[^\d.,-]/g, '').replace(decimalSeparator, '.');

      return Number(result);
    };

    I18N.prototype.df = function df(options, locales) {
      return new this.Intl.DateTimeFormat(locales || this.getLocale(), options);
    };

    I18N.prototype.tr = function tr(key, options) {
      var fullOptions = this.globalVars;

      if (options !== undefined) {
        fullOptions = Object.assign(Object.assign({}, this.globalVars), options);
      }

      return this.i18next.t(key, fullOptions);
    };

    I18N.prototype.registerGlobalVariable = function registerGlobalVariable(key, value) {
      this.globalVars[key] = value;
    };

    I18N.prototype.unregisterGlobalVariable = function unregisterGlobalVariable(key) {
      delete this.globalVars[key];
    };

    I18N.prototype.updateTranslations = function updateTranslations(el) {
      if (!el || !el.querySelectorAll) {
        return;
      }

      var i = void 0;
      var l = void 0;

      var selector = [].concat(this.i18next.options.attributes);
      for (i = 0, l = selector.length; i < l; i++) {
        selector[i] = '[' + selector[i] + ']';
      }selector = selector.join(',');

      var nodes = el.querySelectorAll(selector);
      for (i = 0, l = nodes.length; i < l; i++) {
        var node = nodes[i];
        var keys = void 0;

        for (var i2 = 0, l2 = this.i18next.options.attributes.length; i2 < l2; i2++) {
          keys = node.getAttribute(this.i18next.options.attributes[i2]);
          if (keys) break;
        }

        if (!keys) continue;

        this.updateValue(node, keys);
      }
    };

    I18N.prototype.updateValue = function updateValue(node, value, params) {
      if (value === null || value === undefined) {
        return;
      }

      var keys = value.split(';');
      var i = keys.length;

      while (i--) {
        var key = keys[i];

        var re = /\[([a-z\-]*)\]/ig;

        var m = void 0;
        var attr = 'text';

        if (node.nodeName === 'IMG') attr = 'src';

        while ((m = re.exec(key)) !== null) {
          if (m.index === re.lastIndex) {
            re.lastIndex++;
          }
          if (m) {
            key = key.replace(m[0], '');
            attr = m[1];
          }
        }

        if (!node._textContent) node._textContent = node.textContent;
        if (!node._innerHTML) node._innerHTML = node.innerHTML;

        var attrCC = attr.replace(/-([a-z])/g, function (g) {
          return g[1].toUpperCase();
        });

        switch (attr) {
          case 'text':
            var newChild = _aureliaPal.DOM.createTextNode(this.tr(key, params));
            if (node._newChild) {
              node.removeChild(node._newChild);
            }

            node._newChild = newChild;
            while (node.firstChild) {
              node.removeChild(node.firstChild);
            }
            node.appendChild(node._newChild);
            break;
          case 'prepend':
            var prependParser = _aureliaPal.DOM.createElement('div');
            prependParser.innerHTML = this.tr(key, params);
            for (var ni = node.childNodes.length - 1; ni >= 0; ni--) {
              if (node.childNodes[ni]._prepended) {
                node.removeChild(node.childNodes[ni]);
              }
            }

            for (var pi = prependParser.childNodes.length - 1; pi >= 0; pi--) {
              prependParser.childNodes[pi]._prepended = true;
              if (node.firstChild) {
                node.insertBefore(prependParser.childNodes[pi], node.firstChild);
              } else {
                node.appendChild(prependParser.childNodes[pi]);
              }
            }
            break;
          case 'append':
            var appendParser = _aureliaPal.DOM.createElement('div');
            appendParser.innerHTML = this.tr(key, params);
            for (var _ni = node.childNodes.length - 1; _ni >= 0; _ni--) {
              if (node.childNodes[_ni]._appended) {
                node.removeChild(node.childNodes[_ni]);
              }
            }

            while (appendParser.firstChild) {
              appendParser.firstChild._appended = true;
              node.appendChild(appendParser.firstChild);
            }
            break;
          case 'html':
            node.innerHTML = this.tr(key, params);
            break;
          default:
            if (node.au && node.au.controller && node.au.controller.viewModel && attrCC in node.au.controller.viewModel) {
              node.au.controller.viewModel[attrCC] = this.tr(key, params);
            } else {
              node.setAttribute(attr, this.tr(key, params));
            }

            break;
        }
      }
    };

    return I18N;
  }(), _class.inject = [_aureliaEventAggregator.EventAggregator, _aureliaTemplatingResources.BindingSignaler], _temp);
});
define('aurelia-i18n/relativeTime',['exports', './i18n', './defaultTranslations/relative.time', 'aurelia-event-aggregator'], function (exports, _i18n, _relative, _aureliaEventAggregator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RelativeTime = undefined;

  

  var RelativeTime = exports.RelativeTime = function () {
    RelativeTime.inject = function inject() {
      return [_i18n.I18N, _aureliaEventAggregator.EventAggregator];
    };

    function RelativeTime(i18n, ea) {
      var _this = this;

      

      this.service = i18n;
      this.ea = ea;

      this.service.i18nextReady().then(function () {
        _this.setup();
      });
      this.ea.subscribe('i18n:locale:changed', function (locales) {
        _this.setup(locales);
      });
    }

    RelativeTime.prototype.setup = function setup(locales) {
      var trans = _relative.translations.default || _relative.translations;
      var key = locales && locales.newValue ? locales.newValue : this.service.getLocale();
      var fallbackLng = this.service.i18next.fallbackLng;
      var index = 0;

      if ((index = key.indexOf('-')) >= 0) {
        var baseLocale = key.substring(0, index);

        if (trans[baseLocale]) {
          this.addTranslationResource(baseLocale, trans[baseLocale].translation);
        }
      }

      if (trans[key]) {
        this.addTranslationResource(key, trans[key].translation);
      }
      if (trans[fallbackLng]) {
        this.addTranslationResource(key, trans[fallbackLng].translation);
      }
    };

    RelativeTime.prototype.addTranslationResource = function addTranslationResource(key, translation) {
      var options = this.service.i18next.options;

      if (options.interpolation && options.interpolation.prefix !== '__' || options.interpolation.suffix !== '__') {
        for (var subkey in translation) {
          translation[subkey] = translation[subkey].replace('__count__', options.interpolation.prefix + 'count' + options.interpolation.suffix);
        }
      }

      this.service.i18next.addResources(key, options.defaultNS, translation);
    };

    RelativeTime.prototype.getRelativeTime = function getRelativeTime(time) {
      var now = new Date();
      var diff = now.getTime() - time.getTime();

      var timeDiff = this.getTimeDiffDescription(diff, 'year', 31104000000);
      if (!timeDiff) {
        timeDiff = this.getTimeDiffDescription(diff, 'month', 2592000000);
        if (!timeDiff) {
          timeDiff = this.getTimeDiffDescription(diff, 'day', 86400000);
          if (!timeDiff) {
            timeDiff = this.getTimeDiffDescription(diff, 'hour', 3600000);
            if (!timeDiff) {
              timeDiff = this.getTimeDiffDescription(diff, 'minute', 60000);
              if (!timeDiff) {
                timeDiff = this.getTimeDiffDescription(diff, 'second', 1000);
                if (!timeDiff) {
                  timeDiff = this.service.tr('now');
                }
              }
            }
          }
        }
      }

      return timeDiff;
    };

    RelativeTime.prototype.getTimeDiffDescription = function getTimeDiffDescription(diff, unit, timeDivisor) {
      var unitAmount = (diff / timeDivisor).toFixed(0);
      if (unitAmount > 0) {
        return this.service.tr(unit, { count: parseInt(unitAmount, 10), context: 'ago' });
      } else if (unitAmount < 0) {
        var abs = Math.abs(unitAmount);
        return this.service.tr(unit, { count: abs, context: 'in' });
      }

      return null;
    };

    return RelativeTime;
  }();
});
define('aurelia-i18n/defaultTranslations/relative.time',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var translations = exports.translations = {
    ar: {
      translation: {
        'now': 'الآن',
        'second_ago': 'منذ __count__ ثانية',
        'second_ago_plural': 'منذ __count__ ثواني',
        'second_in': 'في __count__ ثانية',
        'second_in_plural': 'في __count__ ثواني',
        'minute_ago': 'منذ __count__ دقيقة',
        'minute_ago_plural': 'منذ __count__ دقائق',
        'minute_in': 'في __count__ دقيقة',
        'minute_in_plural': 'في __count__ دقائق',
        'hour_ago': 'منذ __count__ ساعة',
        'hour_ago_plural': 'منذ __count__ ساعات',
        'hour_in': 'في __count__ ساعة',
        'hour_in_plural': 'في __count__ ساعات',
        'day_ago': 'منذ __count__ يوم',
        'day_ago_plural': 'منذ __count__ أيام',
        'day_in': 'في __count__ يوم',
        'day_in_plural': 'في __count__ أيام'
      }
    },
    en: {
      translation: {
        'now': 'just now',
        'second_ago': '__count__ second ago',
        'second_ago_plural': '__count__ seconds ago',
        'second_in': 'in __count__ second',
        'second_in_plural': 'in __count__ seconds',
        'minute_ago': '__count__ minute ago',
        'minute_ago_plural': '__count__ minutes ago',
        'minute_in': 'in __count__ minute',
        'minute_in_plural': 'in __count__ minutes',
        'hour_ago': '__count__ hour ago',
        'hour_ago_plural': '__count__ hours ago',
        'hour_in': 'in __count__ hour',
        'hour_in_plural': 'in __count__ hours',
        'day_ago': '__count__ day ago',
        'day_ago_plural': '__count__ days ago',
        'day_in': 'in __count__ day',
        'day_in_plural': 'in __count__ days',
        'month_ago': '__count__ month ago',
        'month_ago_plural': '__count__ months ago',
        'month_in': 'in __count__ month',
        'month_in_plural': 'in __count__ months',
        'year_ago': '__count__ year ago',
        'year_ago_plural': '__count__ years ago',
        'year_in': 'in __count__ year',
        'year_in_plural': 'in __count__ years'
      }
    },
    it: {
      translation: {
        'now': 'adesso',
        'second_ago': '__count__ secondo fa',
        'second_ago_plural': '__count__ secondi fa',
        'second_in': 'in __count__ secondo',
        'second_in_plural': 'in __count__ secondi',
        'minute_ago': '__count__ minuto fa',
        'minute_ago_plural': '__count__ minuti fa',
        'minute_in': 'in __count__ minuto',
        'minute_in_plural': 'in __count__ minuti',
        'hour_ago': '__count__ ora fa',
        'hour_ago_plural': '__count__ ore fa',
        'hour_in': 'in __count__ ora',
        'hour_in_plural': 'in __count__ ore',
        'day_ago': '__count__ giorno fa',
        'day_ago_plural': '__count__ giorni fa',
        'day_in': 'in __count__ giorno',
        'day_in_plural': 'in __count__ giorni',
        'month_ago': '__count__ mese fa',
        'month_ago_plural': '__count__ mesi fa',
        'month_in': 'in __count__ mese',
        'month_in_plural': 'in __count__ mesi',
        'year_ago': '__count__ anno fa',
        'year_ago_plural': '__count__ anni fa',
        'year_in': 'in __count__ anno',
        'year_in_plural': 'in __count__ anni'
      }
    },
    de: {
      translation: {
        'now': 'jetzt gerade',
        'second_ago': 'vor __count__ Sekunde',
        'second_ago_plural': 'vor __count__ Sekunden',
        'second_in': 'in __count__ Sekunde',
        'second_in_plural': 'in __count__ Sekunden',
        'minute_ago': 'vor __count__ Minute',
        'minute_ago_plural': 'vor __count__ Minuten',
        'minute_in': 'in __count__ Minute',
        'minute_in_plural': 'in __count__ Minuten',
        'hour_ago': 'vor __count__ Stunde',
        'hour_ago_plural': 'vor __count__ Stunden',
        'hour_in': 'in __count__ Stunde',
        'hour_in_plural': 'in __count__ Stunden',
        'day_ago': 'vor __count__ Tag',
        'day_ago_plural': 'vor __count__ Tagen',
        'day_in': 'in __count__ Tag',
        'day_in_plural': 'in __count__ Tagen',
        'month_ago': 'vor __count__ Monat',
        'month_ago_plural': 'vor __count__ Monaten',
        'month_in': 'in __count__ Monat',
        'month_in_plural': 'in __count__ Monaten',
        'year_ago': 'vor __count__ Jahr',
        'year_ago_plural': 'vor __count__ Jahren',
        'year_in': 'in __count__ Jahr',
        'year_in_plural': 'in __count__ Jahren'
      }
    },
    nl: {
      translation: {
        'now': 'zonet',
        'second_ago': '__count__ seconde geleden',
        'second_ago_plural': '__count__ seconden geleden',
        'second_in': 'in __count__ seconde',
        'second_in_plural': 'in __count__ seconden',
        'minute_ago': '__count__ minuut geleden',
        'minute_ago_plural': '__count__ minuten geleden',
        'minute_in': 'in __count__ minuut',
        'minute_in_plural': 'in __count__ minuten',
        'hour_ago': '__count__ uur geleden',
        'hour_ago_plural': '__count__ uren geleden',
        'hour_in': 'in __count__ uur',
        'hour_in_plural': 'in __count__ uren',
        'day_ago': '__count__ dag geleden',
        'day_ago_plural': '__count__ dagen geleden',
        'day_in': 'in __count__ dag',
        'day_in_plural': 'in __count__ dagen',
        'month_ago': '__count__ maand geleden',
        'month_ago_plural': '__count__ maanden geleden',
        'month_in': 'in __count__ maand',
        'month_in_plural': 'in __count__ maanden',
        'year_ago': '__count__ jaar geleden',
        'year_ago_plural': '__count__ jaren geleden',
        'year_in': 'in __count__ jaar',
        'year_in_plural': 'in __count__ jaren'
      }
    },
    fr: {
      translation: {
        'now': 'maintenant',
        'second_ago': '__count__ seconde plus tôt',
        'second_ago_plural': '__count__ secondes plus tôt',
        'second_in': 'en __count__ seconde',
        'second_in_plural': 'en __count__ secondes',
        'minute_ago': '__count__ minute plus tôt',
        'minute_ago_plural': '__count__ minutes plus tôt',
        'minute_in': 'en __count__ minute',
        'minute_in_plural': 'en __count__ minutes',
        'hour_ago': '__count__ heure plus tôt',
        'hour_ago_plural': '__count__ heures plus tôt',
        'hour_in': 'en __count__ heure',
        'hour_in_plural': 'en __count__ heures',
        'day_ago': '__count__ jour plus tôt',
        'day_ago_plural': '__count__ jours plus tôt',
        'day_in': 'en __count__ jour',
        'day_in_plural': 'en __count__ jours'
      }
    },
    th: {
      translation: {
        'now': 'เมื่อกี้',
        'second_ago': '__count__ วินาที ที่ผ่านมา',
        'second_ago_plural': '__count__ วินาที ที่ผ่านมา',
        'second_in': 'อีก __count__ วินาที',
        'second_in_plural': 'อีก __count__ วินาที',
        'minute_ago': '__count__ นาที ที่ผ่านมา',
        'minute_ago_plural': '__count__ นาที ที่ผ่านมา',
        'minute_in': 'อีก __count__ นาที',
        'minute_in_plural': 'อีก __count__ นาที',
        'hour_ago': '__count__ ชั่วโมง ที่ผ่านมา',
        'hour_ago_plural': '__count__ ชั่วโมง ที่ผ่านมา',
        'hour_in': 'อีก __count__ ชั่วโมง',
        'hour_in_plural': 'อีก __count__ ชั่วโมง',
        'day_ago': '__count__ วัน ที่ผ่านมา',
        'day_ago_plural': '__count__ วัน ที่ผ่านมา',
        'day_in': 'อีก __count__ วัน',
        'day_in_plural': 'อีก __count__ วัน'
      }
    },
    sv: {
      translation: {
        'now': 'just nu',
        'second_ago': '__count__ sekund sedan',
        'second_ago_plural': '__count__ sekunder sedan',
        'second_in': 'om __count__ sekund',
        'second_in_plural': 'om __count__ sekunder',
        'minute_ago': '__count__ minut sedan',
        'minute_ago_plural': '__count__ minuter sedan',
        'minute_in': 'om __count__ minut',
        'minute_in_plural': 'om __count__ minuter',
        'hour_ago': '__count__ timme sedan',
        'hour_ago_plural': '__count__ timmar sedan',
        'hour_in': 'om __count__ timme',
        'hour_in_plural': 'om __count__ timmar',
        'day_ago': '__count__ dag sedan',
        'day_ago_plural': '__count__ dagar sedan',
        'day_in': 'om __count__ dag',
        'day_in_plural': 'om __count__ dagar'
      }
    },
    da: {
      translation: {
        'now': 'lige nu',
        'second_ago': '__count__ sekunder siden',
        'second_ago_plural': '__count__ sekunder siden',
        'second_in': 'om __count__ sekund',
        'second_in_plural': 'om __count__ sekunder',
        'minute_ago': '__count__ minut siden',
        'minute_ago_plural': '__count__ minutter siden',
        'minute_in': 'om __count__ minut',
        'minute_in_plural': 'om __count__ minutter',
        'hour_ago': '__count__ time siden',
        'hour_ago_plural': '__count__ timer siden',
        'hour_in': 'om __count__ time',
        'hour_in_plural': 'om __count__ timer',
        'day_ago': '__count__ dag siden',
        'day_ago_plural': '__count__ dage siden',
        'day_in': 'om __count__ dag',
        'day_in_plural': 'om __count__ dage'
      }
    },
    no: {
      translation: {
        'now': 'akkurat nå',
        'second_ago': '__count__ sekund siden',
        'second_ago_plural': '__count__ sekunder siden',
        'second_in': 'om __count__ sekund',
        'second_in_plural': 'om __count__ sekunder',
        'minute_ago': '__count__ minutt siden',
        'minute_ago_plural': '__count__ minutter siden',
        'minute_in': 'om __count__ minutt',
        'minute_in_plural': 'om __count__ minutter',
        'hour_ago': '__count__ time siden',
        'hour_ago_plural': '__count__ timer siden',
        'hour_in': 'om __count__ time',
        'hour_in_plural': 'om __count__ timer',
        'day_ago': '__count__ dag siden',
        'day_ago_plural': '__count__ dager siden',
        'day_in': 'om __count__ dag',
        'day_in_plural': 'om __count__ dager'
      }
    },
    jp: {
      translation: {
        'now': 'たった今',
        'second_ago': '__count__ 秒前',
        'second_ago_plural': '__count__ 秒前',
        'second_in': 'あと __count__ 秒',
        'second_in_plural': 'あと __count__ 秒',
        'minute_ago': '__count__ 分前',
        'minute_ago_plural': '__count__ 分前',
        'minute_in': 'あと __count__ 分',
        'minute_in_plural': 'あと __count__ 分',
        'hour_ago': '__count__ 時間前',
        'hour_ago_plural': '__count__ 時間前',
        'hour_in': 'あと __count__ 時間',
        'hour_in_plural': 'あと __count__ 時間',
        'day_ago': '__count__ 日間前',
        'day_ago_plural': '__count__ 日間前',
        'day_in': 'あと __count__ 日間',
        'day_in_plural': 'あと __count__ 日間'
      }
    },
    pt: {
      translation: {
        'now': 'neste exato momento',
        'second_ago': '__count__ segundo atrás',
        'second_ago_plural': '__count__ segundos atrás',
        'second_in': 'em __count__ segundo',
        'second_in_plural': 'em __count__ segundos',
        'minute_ago': '__count__ minuto atrás',
        'minute_ago_plural': '__count__ minutos atrás',
        'minute_in': 'em __count__ minuto',
        'minute_in_plural': 'em __count__ minutos',
        'hour_ago': '__count__ hora atrás',
        'hour_ago_plural': '__count__ horas atrás',
        'hour_in': 'em __count__ hora',
        'hour_in_plural': 'em __count__ horas',
        'day_ago': '__count__ dia atrás',
        'day_ago_plural': '__count__ dias atrás',
        'day_in': 'em __count__ dia',
        'day_in_plural': 'em __count__ dias',
        'month_ago': '__count__ mês atrás',
        'month_ago_plural': '__count__ meses atrás',
        'month_in': 'em __count__ mês',
        'month_in_plural': 'em __count__ meses',
        'year_ago': '__count__ ano atrás',
        'year_ago_plural': '__count__ anos atrás',
        'year_in': 'em __count__ ano',
        'year_in_plural': 'em __count__ anos'
      }
    },
    zh: {
      translation: {
        'now': '刚才',
        'second_ago': '__count__ 秒钟前',
        'second_ago_plural': '__count__ 秒钟前',
        'second_in': '__count__ 秒内',
        'second_in_plural': '__count__ 秒内',
        'minute_ago': '__count__ 分钟前',
        'minute_ago_plural': '__count__ 分钟前',
        'minute_in': '__count__ 分钟内',
        'minute_in_plural': '__count__ 分钟内',
        'hour_ago': '__count__ 小时前',
        'hour_ago_plural': '__count__ 小时前',
        'hour_in': '__count__ 小时内',
        'hour_in_plural': '__count__ 小时内',
        'day_ago': '__count__ 天前',
        'day_ago_plural': '__count__ 天前',
        'day_in': '__count__ 天内',
        'day_in_plural': '__count__ 天内',
        'month_ago': '__count__ 月前',
        'month_ago_plural': '__count__ 月前',
        'month_in': '__count__ 月内',
        'month_in_plural': '__count__ 月内',
        'year_ago': '__count__ 年前',
        'year_ago_plural': '__count__ 年前',
        'year_in': '__count__ 年内',
        'year_in_plural': '__count__ 年内'
      }
    },
    'zh-CN': {
      translation: {
        'now': '刚才',
        'second_ago': '__count__ 秒钟前',
        'second_ago_plural': '__count__ 秒钟前',
        'second_in': '__count__ 秒内',
        'second_in_plural': '__count__ 秒内',
        'minute_ago': '__count__ 分钟前',
        'minute_ago_plural': '__count__ 分钟前',
        'minute_in': '__count__ 分钟内',
        'minute_in_plural': '__count__ 分钟内',
        'hour_ago': '__count__ 小时前',
        'hour_ago_plural': '__count__ 小时前',
        'hour_in': '__count__ 小时内',
        'hour_in_plural': '__count__ 小时内',
        'day_ago': '__count__ 天前',
        'day_ago_plural': '__count__ 天前',
        'day_in': '__count__ 天内',
        'day_in_plural': '__count__ 天内',
        'month_ago': '__count__ 月前',
        'month_ago_plural': '__count__ 月前',
        'month_in': '__count__ 月内',
        'month_in_plural': '__count__ 月内',
        'year_ago': '__count__ 年前',
        'year_ago_plural': '__count__ 年前',
        'year_in': '__count__ 年内',
        'year_in_plural': '__count__ 年内'
      }
    },
    'zh-HK': {
      translation: {
        'now': '剛才',
        'second_ago': '__count__ 秒鐘前',
        'second_ago_plural': '__count__ 秒鐘前',
        'second_in': '__count__ 秒內',
        'second_in_plural': '__count__ 秒內',
        'minute_ago': '__count__ 分鐘前',
        'minute_ago_plural': '__count__ 分鐘前',
        'minute_in': '__count__ 分鐘內',
        'minute_in_plural': '__count__ 分鐘內',
        'hour_ago': '__count__ 小時前',
        'hour_ago_plural': '__count__ 小時前',
        'hour_in': '__count__ 小時內',
        'hour_in_plural': '__count__ 小時內',
        'day_ago': '__count__ 天前',
        'day_ago_plural': '__count__ 天前',
        'day_in': '__count__ 天內',
        'day_in_plural': '__count__ 天內',
        'month_ago': '__count__ 月前',
        'month_ago_plural': '__count__ 月前',
        'month_in': '__count__ 月內',
        'month_in_plural': '__count__ 月內',
        'year_ago': '__count__ 年前',
        'year_ago_plural': '__count__ 年前',
        'year_in': '__count__ 年內',
        'year_in_plural': '__count__ 年內'
      }
    },
    'zh-TW': {
      translation: {
        'now': '剛才',
        'second_ago': '__count__ 秒鐘前',
        'second_ago_plural': '__count__ 秒鐘前',
        'second_in': '__count__ 秒內',
        'second_in_plural': '__count__ 秒內',
        'minute_ago': '__count__ 分鐘前',
        'minute_ago_plural': '__count__ 分鐘前',
        'minute_in': '__count__ 分鐘內',
        'minute_in_plural': '__count__ 分鐘內',
        'hour_ago': '__count__ 小時前',
        'hour_ago_plural': '__count__ 小時前',
        'hour_in': '__count__ 小時內',
        'hour_in_plural': '__count__ 小時內',
        'day_ago': '__count__ 天前',
        'day_ago_plural': '__count__ 天前',
        'day_in': '__count__ 天內',
        'day_in_plural': '__count__ 天內',
        'month_ago': '__count__ 月前',
        'month_ago_plural': '__count__ 月前',
        'month_in': '__count__ 月內',
        'month_in_plural': '__count__ 月內',
        'year_ago': '__count__ 年前',
        'year_ago_plural': '__count__ 年前',
        'year_in': '__count__ 年內',
        'year_in_plural': '__count__ 年內'
      }
    }
  };
});
define('aurelia-i18n/df',['exports', 'aurelia-logging', './i18n', 'aurelia-templating-resources', 'aurelia-binding'], function (exports, _aureliaLogging, _i18n, _aureliaTemplatingResources, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DfBindingBehavior = exports.DfValueConverter = undefined;

  var LogManager = _interopRequireWildcard(_aureliaLogging);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  

  var DfValueConverter = exports.DfValueConverter = function () {
    DfValueConverter.inject = function inject() {
      return [_i18n.I18N];
    };

    function DfValueConverter(i18n) {
      

      this.service = i18n;
    }

    DfValueConverter.prototype.toView = function toView(value, dfOrOptions, locale, df) {
      if (value === null || typeof value === 'undefined' || typeof value === 'string' && value.trim() === '') {
        return value;
      }

      if (dfOrOptions && typeof dfOrOptions.format === 'function') {
        return dfOrOptions.format(value);
      } else if (df) {
        var i18nLogger = LogManager.getLogger('i18n');
        i18nLogger.warn('This ValueConverter signature is depcrecated and will be removed in future releases. Please use the signature [dfOrOptions, locale]');
      } else {
        df = this.service.df(dfOrOptions, locale || this.service.getLocale());
      }

      if (typeof value === 'string' && isNaN(value) && !Number.isInteger(value)) {
        value = new Date(value);
      }

      return df.format(value);
    };

    return DfValueConverter;
  }();

  var DfBindingBehavior = exports.DfBindingBehavior = function () {
    DfBindingBehavior.inject = function inject() {
      return [_aureliaTemplatingResources.SignalBindingBehavior];
    };

    function DfBindingBehavior(signalBindingBehavior) {
      

      this.signalBindingBehavior = signalBindingBehavior;
    }

    DfBindingBehavior.prototype.bind = function bind(binding, source) {
      this.signalBindingBehavior.bind(binding, source, 'aurelia-translation-signal');

      var sourceExpression = binding.sourceExpression;

      if (sourceExpression.rewritten) {
        return;
      }
      sourceExpression.rewritten = true;

      var expression = sourceExpression.expression;
      sourceExpression.expression = new _aureliaBinding.ValueConverter(expression, 'df', sourceExpression.args, [expression].concat(sourceExpression.args));
    };

    DfBindingBehavior.prototype.unbind = function unbind(binding, source) {
      this.signalBindingBehavior.unbind(binding, source);
    };

    return DfBindingBehavior;
  }();
});
define('aurelia-i18n/nf',['exports', 'aurelia-logging', './i18n', 'aurelia-templating-resources', 'aurelia-binding'], function (exports, _aureliaLogging, _i18n, _aureliaTemplatingResources, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NfBindingBehavior = exports.NfValueConverter = undefined;

  var LogManager = _interopRequireWildcard(_aureliaLogging);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  

  var NfValueConverter = exports.NfValueConverter = function () {
    NfValueConverter.inject = function inject() {
      return [_i18n.I18N];
    };

    function NfValueConverter(i18n) {
      

      this.service = i18n;
    }

    NfValueConverter.prototype.toView = function toView(value, nfOrOptions, locale, nf) {
      if (value === null || typeof value === 'undefined' || typeof value === 'string' && value.trim() === '') {
        return value;
      }

      if (nfOrOptions && typeof nfOrOptions.format === 'function') {
        return nfOrOptions.format(value);
      } else if (nf) {
        var i18nLogger = LogManager.getLogger('i18n');
        i18nLogger.warn('This ValueConverter signature is depcrecated and will be removed in future releases. Please use the signature [nfOrOptions, locale]');
      } else {
        nf = this.service.nf(nfOrOptions, locale || this.service.getLocale());
      }

      return nf.format(value);
    };

    return NfValueConverter;
  }();

  var NfBindingBehavior = exports.NfBindingBehavior = function () {
    NfBindingBehavior.inject = function inject() {
      return [_aureliaTemplatingResources.SignalBindingBehavior];
    };

    function NfBindingBehavior(signalBindingBehavior) {
      

      this.signalBindingBehavior = signalBindingBehavior;
    }

    NfBindingBehavior.prototype.bind = function bind(binding, source) {
      this.signalBindingBehavior.bind(binding, source, 'aurelia-translation-signal');

      var sourceExpression = binding.sourceExpression;

      if (sourceExpression.rewritten) {
        return;
      }
      sourceExpression.rewritten = true;

      var expression = sourceExpression.expression;
      sourceExpression.expression = new _aureliaBinding.ValueConverter(expression, 'nf', sourceExpression.args, [expression].concat(sourceExpression.args));
    };

    NfBindingBehavior.prototype.unbind = function unbind(binding, source) {
      this.signalBindingBehavior.unbind(binding, source);
    };

    return NfBindingBehavior;
  }();
});
define('aurelia-i18n/rt',['exports', './relativeTime'], function (exports, _relativeTime) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RtValueConverter = undefined;

  

  var RtValueConverter = exports.RtValueConverter = function () {
    RtValueConverter.inject = function inject() {
      return [_relativeTime.RelativeTime];
    };

    function RtValueConverter(relativeTime) {
      

      this.service = relativeTime;
    }

    RtValueConverter.prototype.toView = function toView(value) {
      if (value === null || typeof value === 'undefined' || typeof value === 'string' && value.trim() === '') {
        return value;
      }

      if (typeof value === 'string' && isNaN(value) && !Number.isInteger(value)) {
        value = new Date(value);
      }

      return this.service.getRelativeTime(value);
    };

    return RtValueConverter;
  }();
});
define('aurelia-i18n/t',['exports', './i18n', 'aurelia-event-aggregator', 'aurelia-templating', 'aurelia-templating-resources', 'aurelia-binding', './utils'], function (exports, _i18n, _aureliaEventAggregator, _aureliaTemplating, _aureliaTemplatingResources, _aureliaBinding, _utils) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TBindingBehavior = exports.TCustomAttribute = exports.TParamsCustomAttribute = exports.TValueConverter = undefined;

  var _dec, _class, _class2, _temp, _dec2, _class3, _class4, _temp2, _class5, _temp3;

  

  var TValueConverter = exports.TValueConverter = function () {
    TValueConverter.inject = function inject() {
      return [_i18n.I18N];
    };

    function TValueConverter(i18n) {
      

      this.service = i18n;
    }

    TValueConverter.prototype.toView = function toView(value, options) {
      return this.service.tr(value, options);
    };

    return TValueConverter;
  }();

  var TParamsCustomAttribute = exports.TParamsCustomAttribute = (_dec = (0, _aureliaTemplating.customAttribute)('t-params'), _dec(_class = (_temp = _class2 = function () {
    function TParamsCustomAttribute(element) {
      

      this.element = element;
    }

    TParamsCustomAttribute.prototype.valueChanged = function valueChanged() {};

    return TParamsCustomAttribute;
  }(), _class2.inject = [Element], _temp)) || _class);
  var TCustomAttribute = exports.TCustomAttribute = (_dec2 = (0, _aureliaTemplating.customAttribute)('t'), _dec2(_class3 = (_temp2 = _class4 = function () {
    function TCustomAttribute(element, i18n, ea, tparams) {
      

      this.element = element;
      this.service = i18n;
      this.ea = ea;
      this.lazyParams = tparams;
    }

    TCustomAttribute.prototype.bind = function bind() {
      var _this = this;

      this.params = this.lazyParams();

      if (this.params) {
        this.params.valueChanged = function (newParams, oldParams) {
          _this.paramsChanged(_this.value, newParams, oldParams);
        };
      }

      var p = this.params !== null ? this.params.value : undefined;
      this.subscription = this.ea.subscribe('i18n:locale:changed', function () {
        _this.service.updateValue(_this.element, _this.value, _this.params !== null ? _this.params.value : undefined);
      });

      this.service.updateValue(this.element, this.value, p);
    };

    TCustomAttribute.prototype.paramsChanged = function paramsChanged(newValue, newParams) {
      this.service.updateValue(this.element, newValue, newParams);
    };

    TCustomAttribute.prototype.valueChanged = function valueChanged(newValue) {
      var p = this.params !== null ? this.params.value : undefined;
      this.service.updateValue(this.element, newValue, p);
    };

    TCustomAttribute.prototype.unbind = function unbind() {
      if (this.subscription) {
        this.subscription.dispose();
      }
    };

    return TCustomAttribute;
  }(), _class4.inject = [Element, _i18n.I18N, _aureliaEventAggregator.EventAggregator, _utils.LazyOptional.of(TParamsCustomAttribute)], _temp2)) || _class3);
  var TBindingBehavior = exports.TBindingBehavior = (_temp3 = _class5 = function () {
    function TBindingBehavior(signalBindingBehavior) {
      

      this.signalBindingBehavior = signalBindingBehavior;
    }

    TBindingBehavior.prototype.bind = function bind(binding, source) {
      this.signalBindingBehavior.bind(binding, source, 'aurelia-translation-signal');

      var sourceExpression = binding.sourceExpression;

      if (sourceExpression.rewritten) {
        return;
      }
      sourceExpression.rewritten = true;

      var expression = sourceExpression.expression;
      sourceExpression.expression = new _aureliaBinding.ValueConverter(expression, 't', sourceExpression.args, [expression].concat(sourceExpression.args));
    };

    TBindingBehavior.prototype.unbind = function unbind(binding, source) {
      this.signalBindingBehavior.unbind(binding, source);
    };

    return TBindingBehavior;
  }(), _class5.inject = [_aureliaTemplatingResources.SignalBindingBehavior], _temp3);
});
define('aurelia-i18n/utils',['exports', 'aurelia-dependency-injection'], function (exports, _aureliaDependencyInjection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LazyOptional = exports.assignObjectToKeys = exports.extend = undefined;

  

  var _dec, _class;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var extend = exports.extend = function extend(destination, source) {
    for (var property in source) {
      destination[property] = source[property];
    }

    return destination;
  };

  var assignObjectToKeys = exports.assignObjectToKeys = function assignObjectToKeys(root, obj) {
    if (obj === undefined || obj === null) {
      return obj;
    }

    var opts = {};

    Object.keys(obj).map(function (key) {
      if (_typeof(obj[key]) === 'object') {
        extend(opts, assignObjectToKeys(key, obj[key]));
      } else {
        opts[root !== '' ? root + '.' + key : key] = obj[key];
      }
    });

    return opts;
  };

  var LazyOptional = exports.LazyOptional = (_dec = (0, _aureliaDependencyInjection.resolver)(), _dec(_class = function () {
    function LazyOptional(key) {
      

      this.key = key;
    }

    LazyOptional.prototype.get = function get(container) {
      var _this = this;

      return function () {
        if (container.hasResolver(_this.key, false)) {
          return container.get(_this.key);
        }
        return null;
      };
    };

    LazyOptional.of = function of(key) {
      return new LazyOptional(key);
    };

    return LazyOptional;
  }()) || _class);
});
define('aurelia-i18n/base-i18n',['exports', './i18n', 'aurelia-event-aggregator'], function (exports, _i18n, _aureliaEventAggregator) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BaseI18N = undefined;

  

  var _class, _temp;

  var BaseI18N = exports.BaseI18N = (_temp = _class = function () {
    function BaseI18N(i18n, element, ea) {
      var _this = this;

      

      this.i18n = i18n;
      this.element = element;

      this.__i18nDisposer = ea.subscribe('i18n:locale:changed', function () {
        _this.i18n.updateTranslations(_this.element);
      });
    }

    BaseI18N.prototype.attached = function attached() {
      this.i18n.updateTranslations(this.element);
    };

    BaseI18N.prototype.detached = function detached() {
      this.__i18nDisposer.dispose();
    };

    return BaseI18N;
  }(), _class.inject = [_i18n.I18N, Element, _aureliaEventAggregator.EventAggregator], _temp);
});
define('aurelia-i18n/aurelia-i18n-loader',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var _class, _temp;

  var Backend = exports.Backend = (_temp = _class = function () {
    Backend.with = function _with(loader) {
      this.loader = loader;
      return this;
    };

    function Backend(services) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      

      this.init(services, options);
      this.type = 'backend';
    }

    Backend.prototype.init = function init(services) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults());
    };

    Backend.prototype.readMulti = function readMulti(languages, namespaces, callback) {
      var loadPath = this.options.loadPath;

      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath(languages, namespaces);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

      this.loadUrl(url, callback);
    };

    Backend.prototype.read = function read(language, namespace, callback) {
      var loadPath = this.options.loadPath;

      if (typeof this.options.loadPath === 'function') {
        loadPath = this.options.loadPath([language], [namespace]);
      }

      var url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

      this.loadUrl(url, callback);
    };

    Backend.prototype.loadUrl = function loadUrl(url, callback) {
      var _this = this;

      this.constructor.loader.loadText(url).then(function (response) {
        var ret = void 0;
        var err = void 0;
        try {
          ret = _this.options.parse(response, url);
        } catch (e) {
          err = 'failed parsing ' + url + ' to json';
        }
        if (err) return callback(err, false);
        callback(null, ret);
      }, function (response) {
        return callback('failed loading ' + url, false);
      });
    };

    Backend.prototype.create = function create(languages, namespace, key, fallbackValue) {};

    return Backend;
  }(), _class.loader = null, _temp);


  Backend.type = 'backend';
  exports.default = Backend;

  var arr = [];
  var each = arr.forEach;
  var slice = arr.slice;

  function getDefaults() {
    return {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: 'locales/add/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      parse: JSON.parse
    };
  }

  function defaults(obj) {
    each.call(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === undefined) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
});
define('odata-filter-parser/dist/odata-parser',['require','exports','module'],function (require, exports, module) {/**
 Copyright 2015 Jason Drake

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

var Operators = {
    EQUALS: 'eq',
    AND: 'and',
    OR: 'or',
    GREATER_THAN: 'gt',
    GREATER_THAN_EQUAL: 'ge',
    LESS_THAN: 'lt',
    LESS_THAN_EQUAL: 'le',
    LIKE: 'like',
    IS_NULL: 'is null',
    NOT_EQUAL: 'ne',

    /**
     * Whether a defined operation is unary or binary.  Will return true
     * if the operation only supports a subject with no value.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is an unary operation.
     */
    isUnary: function (op) {
        var value = false;
        if (op === Operators.IS_NULL) {
            value = true;
        }
        return value;
    },
    /**
     * Whether a defined operation is a logical operators or not.
     *
     * @param {String} op the operation to check.
     * @return {Boolean} whether the operation is a logical operation.
     */
    isLogical: function (op) {
        return (op === Operators.AND || op === Operators.OR);
    }
};

/**
 * Predicate is the basic model construct of the odata expression
 *
 * @param config
 * @returns {Predicate}
 * @constructor
 */
var Predicate = function (config) {
    if (!config) {
        config = {};
    }
    this.subject = config.subject;
    this.value = config.value;
    this.operator = (config.operator) ? config.operator : Operators.EQUALS;
    return this;
};

Predicate.concat = function (operator, p) {
    if (arguments.length < 3 && !(p instanceof Array && p.length >= 2)) {
        throw {
            key: 'INSUFFICIENT_PREDICATES',
            msg: 'At least two predicates are required'
        };
    } else if (!operator || !Operators.isLogical(operator)) {
        throw {
            key: 'INVALID_LOGICAL',
            msg: 'The operator is not representative of a logical operator.'
        };
    }
    var result;
    var arr = [];
    if( p instanceof Array ) {
        arr = p;
    } else {
        for( var i = 1; i < arguments.length; i++ ) {
            arr.push( arguments[i] );
        }
    }
    var len = arr.length;
    result = new Predicate({
        subject: arr[0],
        operator: operator
    });
    if (len === 2) {
        result.value = arr[len - 1];
    } else {
        var a = [];
        for( var j = 1; j < len; j++ ) {
            a.push(arr[j]);
        }
        result.value = Predicate.concat(operator, a);
    }
    return result;
};

Predicate.prototype.flatten = function(result) {
    if( !result ) {
        result = [];
    }
    if( Operators.isLogical(this.operator) ) {
        result = result.concat(this.subject.flatten());
        result = result.concat(this.value.flatten());
    } else {
        result.push(this);
    }
    return result;
};

/**
 * Will serialie the predicate to an ODATA compliant serialized string.
 *
 * @return {String} The compliant ODATA query string
 */
Predicate.prototype.serialize = function() {
    var retValue = '';
    if (this.operator) {
        if (this.subject === undefined || this.subject === null) {
            throw {
                key: 'INVALID_SUBJECT',
                msg: 'The subject is required and is not specified.'
            };
        }
        if (Operators.isLogical(this.operator) && (!(this.subject instanceof Predicate ||
            this.value instanceof Predicate) || (this.subject instanceof Predicate && this.value === undefined))) {
            throw {
                key: 'INVALID_LOGICAL',
                msg: 'The predicate does not represent a valid logical expression.'
            };
        }
        retValue = '(' + ((this.subject instanceof Predicate) ? this.subject.serialize() : this.subject) + ' ' + this.operator;
        if (!Operators.isUnary(this.operator)) {
            if (this.value === undefined || this.value === null) {
                throw {
                    key: 'INVALID_VALUE',
                    msg: 'The value was required but was not defined.'
                };
            }
            retValue += ' ';
            var val = typeof this.value;
            if (val === 'string') {
                retValue += '\'' + this.value + '\'';
            } else if (val === 'number' || val === 'boolean') {
                retValue += this.value;
            } else if (this.value instanceof Predicate) {
                retValue += this.value.serialize();
            } else if (this.value instanceof Date) {
                retValue += 'datetimeoffset\'' + this.value.toISOString() + '\'';
            } else {
                throw {
                    key: 'UNKNOWN_TYPE',
                    msg: 'Unsupported value type: ' + (typeof this.value),
                    source: this.value
                };
            }

        }
        retValue += ')';
    }
    return retValue;
};

var ODataParser = function() {

    "use strict";

    var REGEX = {
        parenthesis: /^([(](.*)[)])$/,
        andor: /^(.*?) (or|and)+ (.*)$/,
        op: /(\w*) (eq|gt|lt|ge|le|ne) (datetimeoffset'(.*)'|'(.*)'|[0-9]*)/,
        startsWith: /^startswith[(](.*),'(.*)'[)]/,
        endsWith: /^endswith[(](.*),'(.*)'[)]/,
        contains: /^contains[(](.*),'(.*)'[)]/
    };

    function buildLike(match, key) {
        var right = (key === 'startsWith') ? match[2] + '*' : (key === 'endsWith') ? '*' + match[2] : '*' + match[2] + '*';
        if( match[0].charAt(match[0].lastIndexOf(')') - 1) === "\'") {
            right = "\'" + right + "\'";
        }
        return {
            subject: match[1],
            operator: Operators.LIKE,
            value: right
        };
    }

    function parseFragment(filter) {
        var found = false;
        var obj = null;
        for (var key in REGEX ) {
            var regex = REGEX[key];
            if( found ) {
                break;
            }
            var match = filter.match(regex);
            if( match ) {
                switch (regex) {
                    case REGEX.parenthesis:
                        if( match.length > 2 ) {
                            if( match[2].indexOf(')') < match[2].indexOf('(')) {
                                continue;
                            }
                            obj = parseFragment(match[2]);
                        }
                        break;
                    case REGEX.andor:
                        obj = new Predicate({
                            subject: parseFragment(match[1]),
                            operator: match[2],
                            value: parseFragment(match[3])
                        });
                        break;
                    case REGEX.op:
                        obj = new Predicate({
                            subject: match[1],
                            operator: match[2],
                            value: ( match[3].indexOf('\'') === -1) ? +match[3] : match[3]
                        });
                        if(obj.value.indexOf && obj.value.indexOf("datetimeoffset") === 0) {
                            var m = obj.value.match(/^datetimeoffset'(.*)'$/);
                            if( m && m.length > 1) {
                                obj.value = new Date(m[1]);
                            }
                        }
                        break;
                    case REGEX.startsWith:
                    case REGEX.endsWith:
                    case REGEX.contains:
                        obj = buildLike(match, key);
                        break;
                }
                found = true;
            }
        }
        return obj;
    }

    return {
        parse: function(filterStr) {
            if( !filterStr || filterStr === '') {
                return null;
            }
            var filter = filterStr.trim();
            var obj = {};
            if( filter.length > 0 ) {
                obj = parseFragment(filter);
            }
            return obj;
        }
    };
}();



module.exports = {
    Parser: ODataParser,
    Operators: Operators,
    Predicate: Predicate
};
});

define('aurelia-dialog/dialog-configuration',["require", "exports", "./renderer", "./dialog-settings", "./dialog-renderer", "aurelia-pal"], function (require, exports, renderer_1, dialog_settings_1, dialog_renderer_1, aurelia_pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultRenderer = dialog_renderer_1.DialogRenderer;
    var resources = {
        'ux-dialog': aurelia_pal_1.PLATFORM.moduleName('./ux-dialog'),
        'ux-dialog-header': aurelia_pal_1.PLATFORM.moduleName('./ux-dialog-header'),
        'ux-dialog-body': aurelia_pal_1.PLATFORM.moduleName('./ux-dialog-body'),
        'ux-dialog-footer': aurelia_pal_1.PLATFORM.moduleName('./ux-dialog-footer'),
        'attach-focus': aurelia_pal_1.PLATFORM.moduleName('./attach-focus')
    };
    // tslint:disable-next-line:max-line-length
    var defaultCSSText = "ux-dialog-container,ux-dialog-overlay{position:fixed;top:0;right:0;bottom:0;left:0}ux-dialog-overlay{opacity:0}ux-dialog-overlay.active{opacity:1}ux-dialog-container{display:block;transition:opacity .2s linear;opacity:0;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}ux-dialog-container.active{opacity:1}ux-dialog-container>div{padding:30px}ux-dialog-container>div>div{display:block;min-width:300px;width:-moz-fit-content;width:-webkit-fit-content;width:fit-content;height:-moz-fit-content;height:-webkit-fit-content;height:fit-content;margin:auto}ux-dialog-container,ux-dialog-container>div,ux-dialog-container>div>div{outline:0}ux-dialog{display:table;box-shadow:0 5px 15px rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.2);border-radius:5px;padding:3px;min-width:300px;width:-moz-fit-content;width:-webkit-fit-content;width:fit-content;height:-moz-fit-content;height:-webkit-fit-content;height:fit-content;margin:auto;border-image-source:initial;border-image-slice:initial;border-image-width:initial;border-image-outset:initial;border-image-repeat:initial;background:#fff}ux-dialog>ux-dialog-header{display:block;padding:16px;border-bottom:1px solid #e5e5e5}ux-dialog>ux-dialog-header>button{float:right;border:none;display:block;width:32px;height:32px;background:0 0;font-size:22px;line-height:16px;margin:-14px -16px 0 0;padding:0;cursor:pointer}ux-dialog>ux-dialog-body{display:block;padding:16px}ux-dialog>ux-dialog-footer{display:block;padding:6px;border-top:1px solid #e5e5e5;text-align:right}ux-dialog>ux-dialog-footer button{color:#333;background-color:#fff;padding:6px 12px;font-size:14px;text-align:center;white-space:nowrap;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;background-image:none;border:1px solid #ccc;border-radius:4px;margin:5px 0 5px 5px}ux-dialog>ux-dialog-footer button:disabled{cursor:default;opacity:.45}ux-dialog>ux-dialog-footer button:hover:enabled{color:#333;background-color:#e6e6e6;border-color:#adadad}.ux-dialog-open{overflow:hidden}";
    /**
     * A configuration builder for the dialog plugin.
     */
    var DialogConfiguration = (function () {
        function DialogConfiguration(frameworkConfiguration, applySetter) {
            var _this = this;
            this.resources = [];
            this.fwConfig = frameworkConfiguration;
            this.settings = this.fwConfig.container.get(dialog_settings_1.DefaultDialogSettings);
            applySetter(function () { return _this._apply(); });
        }
        DialogConfiguration.prototype._apply = function () {
            var _this = this;
            this.fwConfig.transient(renderer_1.Renderer, this.renderer);
            this.resources.forEach(function (resourceName) { return _this.fwConfig.globalResources(resources[resourceName]); });
            if (this.cssText) {
                aurelia_pal_1.DOM.injectStyles(this.cssText);
            }
        };
        /**
         * Selects the Aurelia conventional defaults for the dialog plugin.
         * @return This instance.
         */
        DialogConfiguration.prototype.useDefaults = function () {
            return this.useRenderer(defaultRenderer)
                .useCSS(defaultCSSText)
                .useStandardResources();
        };
        /**
         * Exports the standard set of dialog behaviors to Aurelia's global resources.
         * @return This instance.
         */
        DialogConfiguration.prototype.useStandardResources = function () {
            return this.useResource('ux-dialog')
                .useResource('ux-dialog-header')
                .useResource('ux-dialog-body')
                .useResource('ux-dialog-footer')
                .useResource('attach-focus');
        };
        /**
         * Exports the chosen dialog element or view to Aurelia's global resources.
         * @param resourceName The name of the dialog resource to export.
         * @return This instance.
         */
        DialogConfiguration.prototype.useResource = function (resourceName) {
            this.resources.push(resourceName);
            return this;
        };
        /**
         * Configures the plugin to use a specific dialog renderer.
         * @param renderer A type that implements the Renderer interface.
         * @param settings Global settings for the renderer.
         * @return This instance.
         */
        DialogConfiguration.prototype.useRenderer = function (renderer, settings) {
            this.renderer = renderer;
            if (settings) {
                Object.assign(this.settings, settings);
            }
            return this;
        };
        /**
         * Configures the plugin to use specific css.
         * @param cssText The css to use in place of the default styles.
         * @return This instance.
         */
        DialogConfiguration.prototype.useCSS = function (cssText) {
            this.cssText = cssText;
            return this;
        };
        return DialogConfiguration;
    }());
    exports.DialogConfiguration = DialogConfiguration;
});

define('aurelia-dialog/renderer',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * An abstract base class for implementors of the basic Renderer API.
     */
    var Renderer = (function () {
        function Renderer() {
        }
        /**
         * Gets an anchor for the ViewSlot to insert a view into.
         * @returns A DOM element.
         */
        Renderer.prototype.getDialogContainer = function () {
            throw new Error('DialogRenderer must implement getDialogContainer().');
        };
        /**
         * Displays the dialog.
         * @returns Promise A promise that resolves when the dialog has been displayed.
         */
        Renderer.prototype.showDialog = function (dialogController) {
            throw new Error('DialogRenderer must implement showDialog().');
        };
        /**
         * Hides the dialog.
         * @returns Promise A promise that resolves when the dialog has been hidden.
         */
        Renderer.prototype.hideDialog = function (dialogController) {
            throw new Error('DialogRenderer must implement hideDialog().');
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});

define('aurelia-dialog/dialog-settings',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @internal
     */
    var DefaultDialogSettings = (function () {
        function DefaultDialogSettings() {
            this.lock = true;
            this.startingZIndex = 1000;
            this.centerHorizontalOnly = false;
            this.rejectOnCancel = false;
            this.ignoreTransitions = false;
        }
        return DefaultDialogSettings;
    }());
    exports.DefaultDialogSettings = DefaultDialogSettings;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/dialog-renderer',["require", "exports", "aurelia-pal", "aurelia-dependency-injection"], function (require, exports, aurelia_pal_1, aurelia_dependency_injection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var containerTagName = 'ux-dialog-container';
    var overlayTagName = 'ux-dialog-overlay';
    exports.transitionEvent = (function () {
        var transition;
        return function () {
            if (transition) {
                return transition;
            }
            var el = aurelia_pal_1.DOM.createElement('fakeelement');
            var transitions = {
                transition: 'transitionend',
                OTransition: 'oTransitionEnd',
                MozTransition: 'transitionend',
                WebkitTransition: 'webkitTransitionEnd'
            };
            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    transition = transitions[t];
                    return transition;
                }
            }
            return '';
        };
    })();
    exports.hasTransition = (function () {
        var unprefixedName = 'transitionDuration';
        var el = aurelia_pal_1.DOM.createElement('fakeelement');
        var prefixedNames = ['webkitTransitionDuration', 'oTransitionDuration'];
        var transitionDurationName;
        if (unprefixedName in el.style) {
            transitionDurationName = unprefixedName;
        }
        else {
            transitionDurationName = prefixedNames.find(function (prefixed) { return (prefixed in el.style); });
        }
        return function (element) {
            return !!transitionDurationName && !!(aurelia_pal_1.DOM.getComputedStyle(element)[transitionDurationName]
                .split(',')
                .find(function (duration) { return !!parseFloat(duration); }));
        };
    })();
    var body = aurelia_pal_1.DOM.querySelectorAll('body')[0];
    function getActionKey(e) {
        if ((e.code || e.key) === 'Escape' || e.keyCode === 27) {
            return 'Escape';
        }
        if ((e.code || e.key) === 'Enter' || e.keyCode === 13) {
            return 'Enter';
        }
        return undefined;
    }
    var DialogRenderer = DialogRenderer_1 = (function () {
        function DialogRenderer() {
        }
        DialogRenderer.keyboardEventHandler = function (e) {
            var key = getActionKey(e);
            if (!key) {
                return;
            }
            var top = DialogRenderer_1.dialogControllers[DialogRenderer_1.dialogControllers.length - 1];
            if (!top || !top.settings.keyboard) {
                return;
            }
            var keyboard = top.settings.keyboard;
            if (key === 'Escape'
                && (keyboard === true || keyboard === key || (Array.isArray(keyboard) && keyboard.indexOf(key) > -1))) {
                top.cancel();
            }
            else if (key === 'Enter' && (keyboard === key || (Array.isArray(keyboard) && keyboard.indexOf(key) > -1))) {
                top.ok();
            }
        };
        DialogRenderer.trackController = function (dialogController) {
            if (!DialogRenderer_1.dialogControllers.length) {
                aurelia_pal_1.DOM.addEventListener('keyup', DialogRenderer_1.keyboardEventHandler, false);
            }
            DialogRenderer_1.dialogControllers.push(dialogController);
        };
        DialogRenderer.untrackController = function (dialogController) {
            var i = DialogRenderer_1.dialogControllers.indexOf(dialogController);
            if (i !== -1) {
                DialogRenderer_1.dialogControllers.splice(i, 1);
            }
            if (!DialogRenderer_1.dialogControllers.length) {
                aurelia_pal_1.DOM.removeEventListener('keyup', DialogRenderer_1.keyboardEventHandler, false);
            }
        };
        DialogRenderer.prototype.getOwnElements = function (parent, selector) {
            var elements = parent.querySelectorAll(selector);
            var own = [];
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].parentElement === parent) {
                    own.push(elements[i]);
                }
            }
            return own;
        };
        DialogRenderer.prototype.attach = function (dialogController) {
            var spacingWrapper = aurelia_pal_1.DOM.createElement('div'); // TODO: check if redundant
            spacingWrapper.appendChild(this.anchor);
            this.dialogContainer = aurelia_pal_1.DOM.createElement(containerTagName);
            this.dialogContainer.appendChild(spacingWrapper);
            this.dialogOverlay = aurelia_pal_1.DOM.createElement(overlayTagName);
            var zIndex = typeof dialogController.settings.startingZIndex === 'number'
                ? dialogController.settings.startingZIndex + ''
                : null;
            this.dialogOverlay.style.zIndex = zIndex;
            this.dialogContainer.style.zIndex = zIndex;
            var lastContainer = this.getOwnElements(this.host, containerTagName).pop();
            if (lastContainer && lastContainer.parentElement) {
                this.host.insertBefore(this.dialogContainer, lastContainer.nextSibling);
                this.host.insertBefore(this.dialogOverlay, lastContainer.nextSibling);
            }
            else {
                this.host.insertBefore(this.dialogContainer, this.host.firstChild);
                this.host.insertBefore(this.dialogOverlay, this.host.firstChild);
            }
            dialogController.controller.attached();
            this.host.classList.add('ux-dialog-open');
        };
        DialogRenderer.prototype.detach = function (dialogController) {
            this.host.removeChild(this.dialogOverlay);
            this.host.removeChild(this.dialogContainer);
            dialogController.controller.detached();
            if (!DialogRenderer_1.dialogControllers.length) {
                this.host.classList.remove('ux-dialog-open');
            }
        };
        DialogRenderer.prototype.setAsActive = function () {
            this.dialogOverlay.classList.add('active');
            this.dialogContainer.classList.add('active');
        };
        DialogRenderer.prototype.setAsInactive = function () {
            this.dialogOverlay.classList.remove('active');
            this.dialogContainer.classList.remove('active');
        };
        DialogRenderer.prototype.setupClickHandling = function (dialogController) {
            this.stopPropagation = function (e) { e._aureliaDialogHostClicked = true; };
            this.closeDialogClick = function (e) {
                if (dialogController.settings.overlayDismiss && !e._aureliaDialogHostClicked) {
                    dialogController.cancel();
                    return;
                }
                if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                return false;
            };
            this.dialogContainer.addEventListener('click', this.closeDialogClick);
            this.anchor.addEventListener('click', this.stopPropagation);
        };
        DialogRenderer.prototype.clearClickHandling = function () {
            this.dialogContainer.removeEventListener('click', this.closeDialogClick);
            this.anchor.removeEventListener('click', this.stopPropagation);
        };
        DialogRenderer.prototype.centerDialog = function () {
            var child = this.dialogContainer.children[0];
            var vh = Math.max(aurelia_pal_1.DOM.querySelectorAll('html')[0].clientHeight, window.innerHeight || 0);
            child.style.marginTop = Math.max((vh - child.offsetHeight) / 2, 30) + 'px';
            child.style.marginBottom = Math.max((vh - child.offsetHeight) / 2, 30) + 'px';
        };
        DialogRenderer.prototype.awaitTransition = function (setActiveInactive, ignore) {
            var _this = this;
            return new Promise(function (resolve) {
                var renderer = _this;
                var eventName = exports.transitionEvent();
                function onTransitionEnd(e) {
                    if (e.target !== renderer.dialogContainer) {
                        return;
                    }
                    renderer.dialogContainer.removeEventListener(eventName, onTransitionEnd);
                    resolve();
                }
                if (ignore || !exports.hasTransition(_this.dialogContainer)) {
                    resolve();
                }
                else {
                    _this.dialogContainer.addEventListener(eventName, onTransitionEnd);
                }
                setActiveInactive();
            });
        };
        DialogRenderer.prototype.getDialogContainer = function () {
            return this.anchor || (this.anchor = aurelia_pal_1.DOM.createElement('div'));
        };
        DialogRenderer.prototype.showDialog = function (dialogController) {
            var _this = this;
            if (dialogController.settings.host) {
                this.host = dialogController.settings.host;
            }
            else {
                this.host = body;
            }
            var settings = dialogController.settings;
            this.attach(dialogController);
            if (typeof settings.position === 'function') {
                settings.position(this.dialogContainer, this.dialogOverlay);
            }
            else if (!settings.centerHorizontalOnly) {
                this.centerDialog();
            }
            DialogRenderer_1.trackController(dialogController);
            this.setupClickHandling(dialogController);
            return this.awaitTransition(function () { return _this.setAsActive(); }, dialogController.settings.ignoreTransitions);
        };
        DialogRenderer.prototype.hideDialog = function (dialogController) {
            var _this = this;
            this.clearClickHandling();
            DialogRenderer_1.untrackController(dialogController);
            return this.awaitTransition(function () { return _this.setAsInactive(); }, dialogController.settings.ignoreTransitions)
                .then(function () { _this.detach(dialogController); });
        };
        return DialogRenderer;
    }());
    DialogRenderer.dialogControllers = [];
    DialogRenderer = DialogRenderer_1 = __decorate([
        aurelia_dependency_injection_1.transient()
    ], DialogRenderer);
    exports.DialogRenderer = DialogRenderer;
    var DialogRenderer_1;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/ux-dialog',["require", "exports", "aurelia-templating"], function (require, exports, aurelia_templating_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UxDialog = (function () {
        function UxDialog() {
        }
        return UxDialog;
    }());
    UxDialog = __decorate([
        aurelia_templating_1.customElement('ux-dialog'),
        aurelia_templating_1.inlineView("\n  <template>\n    <slot></slot>\n  </template>\n")
    ], UxDialog);
    exports.UxDialog = UxDialog;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/ux-dialog-header',["require", "exports", "aurelia-templating", "./dialog-controller"], function (require, exports, aurelia_templating_1, dialog_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UxDialogHeader = (function () {
        function UxDialogHeader(controller) {
            this.controller = controller;
        }
        UxDialogHeader.prototype.bind = function () {
            if (typeof this.showCloseButton !== 'boolean') {
                this.showCloseButton = !this.controller.settings.lock;
            }
        };
        return UxDialogHeader;
    }());
    /**
     * @internal
     */
    UxDialogHeader.inject = [dialog_controller_1.DialogController];
    __decorate([
        aurelia_templating_1.bindable()
    ], UxDialogHeader.prototype, "showCloseButton", void 0);
    UxDialogHeader = __decorate([
        aurelia_templating_1.customElement('ux-dialog-header'),
        aurelia_templating_1.inlineView("\n  <template>\n    <button\n      type=\"button\"\n      class=\"dialog-close\"\n      aria-label=\"Close\"\n      if.bind=\"showCloseButton\"\n      click.trigger=\"controller.cancel()\">\n      <span aria-hidden=\"true\">&times;</span>\n    </button>\n\n    <div class=\"dialog-header-content\">\n      <slot></slot>\n    </div>\n  </template>\n")
    ], UxDialogHeader);
    exports.UxDialogHeader = UxDialogHeader;
});

define('aurelia-dialog/dialog-controller',["require", "exports", "./renderer", "./lifecycle", "./dialog-cancel-error"], function (require, exports, renderer_1, lifecycle_1, dialog_cancel_error_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * A controller object for a Dialog instance.
     */
    var DialogController = (function () {
        /**
         * Creates an instance of DialogController.
         */
        function DialogController(renderer, settings, resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
            this.settings = settings;
            this.renderer = renderer;
        }
        /**
         * @internal
         */
        DialogController.prototype.releaseResources = function () {
            var _this = this;
            return lifecycle_1.invokeLifecycle(this.controller.viewModel || {}, 'deactivate')
                .then(function () { return _this.renderer.hideDialog(_this); })
                .then(function () { _this.controller.unbind(); });
        };
        /**
         * @internal
         */
        DialogController.prototype.cancelOperation = function () {
            if (!this.settings.rejectOnCancel) {
                return { wasCancelled: true };
            }
            throw dialog_cancel_error_1.createDialogCancelError();
        };
        /**
         * Closes the dialog with a successful output.
         * @param output The returned success output.
         */
        DialogController.prototype.ok = function (output) {
            return this.close(true, output);
        };
        /**
         * Closes the dialog with a cancel output.
         * @param output The returned cancel output.
         */
        DialogController.prototype.cancel = function (output) {
            return this.close(false, output);
        };
        /**
         * Closes the dialog with an error result.
         * @param message An error message.
         * @returns Promise An empty promise object.
         */
        DialogController.prototype.error = function (message) {
            var _this = this;
            return this.releaseResources().then(function () { _this.reject(message); });
        };
        /**
         * Closes the dialog.
         * @param ok Whether or not the user input signified success.
         * @param output The specified output.
         * @returns Promise An empty promise object.
         */
        DialogController.prototype.close = function (ok, output) {
            var _this = this;
            if (this.closePromise) {
                return this.closePromise;
            }
            return this.closePromise = lifecycle_1.invokeLifecycle(this.controller.viewModel || {}, 'canDeactivate').catch(function (reason) {
                _this.closePromise = undefined;
                return Promise.reject(reason);
            }).then(function (canDeactivate) {
                if (!canDeactivate) {
                    _this.closePromise = undefined; // we are done, do not block consecutive calls
                    return _this.cancelOperation();
                }
                return _this.releaseResources().then(function () {
                    if (!_this.settings.rejectOnCancel || ok) {
                        _this.resolve({ wasCancelled: !ok, output: output });
                    }
                    else {
                        _this.reject(dialog_cancel_error_1.createDialogCancelError(output));
                    }
                    return { wasCancelled: false };
                }).catch(function (reason) {
                    _this.closePromise = undefined;
                    return Promise.reject(reason);
                });
            });
        };
        return DialogController;
    }());
    /**
     * @internal
     */
    DialogController.inject = [renderer_1.Renderer];
    exports.DialogController = DialogController;
});

define('aurelia-dialog/lifecycle',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Call a lifecycle method on a viewModel if it exists.
     * @function
     * @param instance The viewModel instance.
     * @param name The lifecycle method name.
     * @param model The model to pass to the lifecycle method.
     * @returns Promise The result of the lifecycle method.
     */
    function invokeLifecycle(instance, name, model) {
        if (typeof instance[name] === 'function') {
            return new Promise(function (resolve) {
                resolve(instance[name](model));
            }).then(function (result) {
                if (result !== null && result !== undefined) {
                    return result;
                }
                return true;
            });
        }
        return Promise.resolve(true);
    }
    exports.invokeLifecycle = invokeLifecycle;
});

define('aurelia-dialog/dialog-cancel-error',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @internal
     */
    function createDialogCancelError(output) {
        var error = new Error('Operation cancelled.');
        error.wasCancelled = true;
        error.output = output;
        return error;
    }
    exports.createDialogCancelError = createDialogCancelError;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/ux-dialog-body',["require", "exports", "aurelia-templating"], function (require, exports, aurelia_templating_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var UxDialogBody = (function () {
        function UxDialogBody() {
        }
        return UxDialogBody;
    }());
    UxDialogBody = __decorate([
        aurelia_templating_1.customElement('ux-dialog-body'),
        aurelia_templating_1.inlineView("\n  <template>\n    <slot></slot>\n  </template>\n")
    ], UxDialogBody);
    exports.UxDialogBody = UxDialogBody;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/ux-dialog-footer',["require", "exports", "aurelia-templating", "./dialog-controller"], function (require, exports, aurelia_templating_1, dialog_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * View-model for footer of Dialog.
     */
    var UxDialogFooter = UxDialogFooter_1 = (function () {
        function UxDialogFooter(controller) {
            this.controller = controller;
            this.buttons = [];
            this.useDefaultButtons = false;
        }
        UxDialogFooter.isCancelButton = function (value) {
            return value === 'Cancel';
        };
        UxDialogFooter.prototype.close = function (buttonValue) {
            if (UxDialogFooter_1.isCancelButton(buttonValue)) {
                this.controller.cancel(buttonValue);
            }
            else {
                this.controller.ok(buttonValue);
            }
        };
        UxDialogFooter.prototype.useDefaultButtonsChanged = function (newValue) {
            if (newValue) {
                this.buttons = ['Cancel', 'Ok'];
            }
        };
        return UxDialogFooter;
    }());
    /**
     * @internal
     */
    UxDialogFooter.inject = [dialog_controller_1.DialogController];
    __decorate([
        aurelia_templating_1.bindable
    ], UxDialogFooter.prototype, "buttons", void 0);
    __decorate([
        aurelia_templating_1.bindable
    ], UxDialogFooter.prototype, "useDefaultButtons", void 0);
    UxDialogFooter = UxDialogFooter_1 = __decorate([
        aurelia_templating_1.customElement('ux-dialog-footer'),
        aurelia_templating_1.inlineView("\n  <template>\n    <slot></slot>\n    <template if.bind=\"buttons.length > 0\">\n      <button type=\"button\"\n        class=\"btn btn-default\"\n        repeat.for=\"button of buttons\"\n        click.trigger=\"close(button)\">\n        ${button}\n      </button>\n    </template>\n  </template>\n")
    ], UxDialogFooter);
    exports.UxDialogFooter = UxDialogFooter;
    var UxDialogFooter_1;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('aurelia-dialog/attach-focus',["require", "exports", "aurelia-templating", "aurelia-pal"], function (require, exports, aurelia_templating_1, aurelia_pal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AttachFocus = (function () {
        function AttachFocus(element) {
            this.element = element;
            this.value = true;
        }
        AttachFocus.prototype.attached = function () {
            if (this.value && this.value !== 'false') {
                this.element.focus();
            }
        };
        AttachFocus.prototype.valueChanged = function (newValue) {
            this.value = newValue;
        };
        return AttachFocus;
    }());
    /**
     * @internal
     */
    AttachFocus.inject = [aurelia_pal_1.DOM.Element];
    AttachFocus = __decorate([
        aurelia_templating_1.customAttribute('attach-focus')
    ], AttachFocus);
    exports.AttachFocus = AttachFocus;
});

define('aurelia-dialog/dialog-service',["require", "exports", "aurelia-dependency-injection", "aurelia-metadata", "aurelia-templating", "./dialog-settings", "./dialog-cancel-error", "./lifecycle", "./dialog-controller"], function (require, exports, aurelia_dependency_injection_1, aurelia_metadata_1, aurelia_templating_1, dialog_settings_1, dialog_cancel_error_1, lifecycle_1, dialog_controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* tslint:enable:max-line-length */
    function whenClosed(onfulfilled, onrejected) {
        return this.then(function (r) { return r.wasCancelled ? r : r.closeResult; }).then(onfulfilled, onrejected);
    }
    function asDialogOpenPromise(promise) {
        promise.whenClosed = whenClosed;
        return promise;
    }
    /**
     * A service allowing for the creation of dialogs.
     */
    var DialogService = (function () {
        function DialogService(container, compositionEngine, defaultSettings) {
            /**
             * The current dialog controllers
             */
            this.controllers = [];
            /**
             * Is there an open dialog
             */
            this.hasOpenDialog = false;
            this.hasActiveDialog = false;
            this.container = container;
            this.compositionEngine = compositionEngine;
            this.defaultSettings = defaultSettings;
        }
        DialogService.prototype.validateSettings = function (settings) {
            if (!settings.viewModel && !settings.view) {
                throw new Error('Invalid Dialog Settings. You must provide "viewModel", "view" or both.');
            }
        };
        // tslint:disable-next-line:max-line-length
        DialogService.prototype.createCompositionContext = function (childContainer, host, settings) {
            return {
                container: childContainer.parent,
                childContainer: childContainer,
                bindingContext: null,
                viewResources: null,
                model: settings.model,
                view: settings.view,
                viewModel: settings.viewModel,
                viewSlot: new aurelia_templating_1.ViewSlot(host, true),
                host: host
            };
        };
        DialogService.prototype.ensureViewModel = function (compositionContext) {
            if (typeof compositionContext.viewModel === 'function') {
                compositionContext.viewModel = aurelia_metadata_1.Origin.get(compositionContext.viewModel).moduleId;
            }
            if (typeof compositionContext.viewModel === 'string') {
                return this.compositionEngine.ensureViewModel(compositionContext);
            }
            return Promise.resolve(compositionContext);
        };
        DialogService.prototype._cancelOperation = function (rejectOnCancel) {
            if (!rejectOnCancel) {
                return { wasCancelled: true };
            }
            throw dialog_cancel_error_1.createDialogCancelError();
        };
        // tslint:disable-next-line:max-line-length
        DialogService.prototype.composeAndShowDialog = function (compositionContext, dialogController) {
            var _this = this;
            if (!compositionContext.viewModel) {
                // provide access to the dialog controller for view only dialogs
                compositionContext.bindingContext = { controller: dialogController };
            }
            return this.compositionEngine.compose(compositionContext).then(function (controller) {
                dialogController.controller = controller;
                return dialogController.renderer.showDialog(dialogController).then(function () {
                    _this.controllers.push(dialogController);
                    _this.hasActiveDialog = _this.hasOpenDialog = !!_this.controllers.length;
                }, function (reason) {
                    if (controller.viewModel) {
                        lifecycle_1.invokeLifecycle(controller.viewModel, 'deactivate');
                    }
                    return Promise.reject(reason);
                });
            });
        };
        /**
         * @internal
         */
        DialogService.prototype.createSettings = function (settings) {
            settings = Object.assign({}, this.defaultSettings, settings);
            if (typeof settings.keyboard !== 'boolean' && !settings.keyboard) {
                settings.keyboard = !settings.lock;
            }
            if (typeof settings.overlayDismiss !== 'boolean') {
                settings.overlayDismiss = !settings.lock;
            }
            Object.defineProperty(settings, 'rejectOnCancel', {
                writable: false,
                configurable: true,
                enumerable: true
            });
            this.validateSettings(settings);
            return settings;
        };
        DialogService.prototype.open = function (settings) {
            var _this = this;
            if (settings === void 0) { settings = {}; }
            // tslint:enable:max-line-length
            settings = this.createSettings(settings);
            var childContainer = settings.childContainer || this.container.createChild();
            var resolveCloseResult;
            var rejectCloseResult;
            var closeResult = new Promise(function (resolve, reject) {
                resolveCloseResult = resolve;
                rejectCloseResult = reject;
            });
            var dialogController = childContainer.invoke(dialog_controller_1.DialogController, [settings, resolveCloseResult, rejectCloseResult]);
            childContainer.registerInstance(dialog_controller_1.DialogController, dialogController);
            closeResult.then(function () {
                removeController(_this, dialogController);
            }, function () {
                removeController(_this, dialogController);
            });
            var compositionContext = this.createCompositionContext(childContainer, dialogController.renderer.getDialogContainer(), dialogController.settings);
            var openResult = this.ensureViewModel(compositionContext).then(function (compositionContext) {
                if (!compositionContext.viewModel) {
                    return true;
                }
                return lifecycle_1.invokeLifecycle(compositionContext.viewModel, 'canActivate', dialogController.settings.model);
            }).then(function (canActivate) {
                if (!canActivate) {
                    return _this._cancelOperation(dialogController.settings.rejectOnCancel);
                }
                // if activation granted, compose and show
                return _this.composeAndShowDialog(compositionContext, dialogController)
                    .then(function () { return ({ controller: dialogController, closeResult: closeResult, wasCancelled: false }); });
            });
            return asDialogOpenPromise(openResult);
        };
        /**
         * Closes all open dialogs at the time of invocation.
         * @return Promise<DialogController[]> All controllers whose close operation was cancelled.
         */
        DialogService.prototype.closeAll = function () {
            return Promise.all(this.controllers.slice(0).map(function (controller) {
                if (!controller.settings.rejectOnCancel) {
                    return controller.cancel().then(function (result) {
                        if (result.wasCancelled) {
                            return controller;
                        }
                        return;
                    });
                }
                return controller.cancel().then(function () { return; }).catch(function (reason) {
                    if (reason.wasCancelled) {
                        return controller;
                    }
                    return Promise.reject(reason);
                });
            })).then(function (unclosedControllers) { return unclosedControllers.filter(function (unclosed) { return !!unclosed; }); });
        };
        return DialogService;
    }());
    /**
     * @internal
     */
    DialogService.inject = [aurelia_dependency_injection_1.Container, aurelia_templating_1.CompositionEngine, dialog_settings_1.DefaultDialogSettings];
    exports.DialogService = DialogService;
    function removeController(service, dialogController) {
        var i = service.controllers.indexOf(dialogController);
        if (i !== -1) {
            service.controllers.splice(i, 1);
            service.hasActiveDialog = service.hasOpenDialog = !!service.controllers.length;
        }
    }
});

define('text!app/app.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <nav-bar router.bind=\"router\" username.bind=\"username\"></nav-bar>\n        <div class=\"page-margins\">\n            <router-view></router-view>\n        </div>\n        <site-footer router.bind=\"router\" languages.bind=\"languages\"></site-footer>\n    </div>\n</template>\n"; });
define('text!components/nav-bar/nav-bar.html', ['module'], function(module) { module.exports = "<template bindable=\"router\">\n    <div class=\"top-bar c-topbar\">\n        <div class=\"top-bar-title o-flex\">\n            <span data-responsive-toggle=\"responsive-menu\" data-hide-for=\"medium\" class=\"o-flex__cell\">\n                <button type=\"button\" data-toggle class=\"c-topbar-menu u-gutt-sm-2\">\n                    <i t=\"[class]menu_icon\"></i>\n                </button>\n            </span>\n            <div class=\"o-flex__cell\">\n                <img data-src=\"images/logo-small.png\" class=\"c-topbar-logo u-gutt-sm-2\" t=\"logo-small_src;[alt]logo_alt\"/>\n            </div>\n            <div class=\"o-flex__cell\">\n                <span t=\"app_title\" class=\"c-topbar-title u-dis-b u-gutt-sm-2\">\n                </span>\n            </div>\n        </div>\n        <div id=\"responsive-menu\">\n            <div class=\"top-bar-right\">\n                <ul class=\"menu vertical\">\n                    <li repeat.for=\"row of router.navigation | authFilter: isAuthenticated\" class=\"${row.isActive ? 'active' : ''}\">\n                        <a href.bind=\"row.href\" t.bind=\"row.settings.t\">\n                            ${row.title}\n                        </a>\n                    </li>\n                    <li>\n                        <a class=\"top\" click.trigger=\"goToLogout($event)\" if.bind=\"isAuthenticated\">\n                            <span t=\"go-to-logout_button\"></span>\n                        </a>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    </div>\n    <loading-indicator loading.bind=\"router.isNavigating || api.isRequesting\"></loading-indicator>\n</template>\n"; });
define('text!components/site-footer/site-footer.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <span class=\"text-center copyright\">\n                <i t=\"[class]copyright_icon\"></i><span t=\"copyright_message\"></span>\n            </span>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/validation-summary/validation-summary.html', ['module'], function(module) { module.exports = "<template bindable=\"errors, autofocus\">\n    <div class=\"alert callout\" show.bind=\"errors.length\" focus.one-way=\"autofocus && errors.length > 0\">\n        <ul class=\"no-bullet\">\n            <li repeat.for=\"errorInfo of errors\">\n                <a class=\"c-cta c-cta--alert\" href=\"#\" click.delegate=\"errorInfo.targets[0].focus()\">${errorInfo.error.message}</a>\n            </li>\n        </ul>\n    </div>\n</template>\n"; });
define('text!components/views/challenge-with-challenge-questions/challenge-with-challenge-questions.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]challenge-questions_icon\"></i>\n                <span t=\"challenge-with-challenge-questions_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]challenge-with-challenge-questions_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset\">\n                    <validation-summary errors.bind=\"errors\" autofocus.bind=\"controller.validateTrigger === 'manual'\">\n                    </validation-summary>\n                    <div class=\"u-gutt-3\" repeat.for=\"challengeQuestion of vm.user.challengeQuestions\">\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-input-${$index}\" t=\"challenge-question_label\"></label>\n                            <select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=\"challengeQuestion.selectedAvailableChallengeQuestion\" disabled=\"disabled\">\n                                <option model.bind=\"null\" value=\"\" t=\"challenge-question_option-default\"></option>\n                                <option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=\"availableChallengeQuestion\">${availableChallengeQuestion.challengeQuestionText}</option>\n                            </select>\n                        </div>\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-answer-input-${$index}\" t=\"challenge-question-answer_label\"></label>\n                            <input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=\"[placeholder]challenge-question-answer_placeholder\">\n                        </div>\n                        <div class=\"form-row\">\n                            <input type=\"checkbox\" checked.bind=\"challengeQuestion.showActualAnswer\" id=\"show-actual-answer-input-${$index}\"/>\n                            <label for=\"show-actual-answer-input-${$index}\" t=\"show-actual-answer_label\"></label>\n                        </div>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/challenge-with-email-info/challenge-with-email-info.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]challenge-questions_icon\"></i>\n                <span t=\"challenge-with-challenge-questions_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]challenge-with-challenge-questions_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset u-gutt-3\">\n                    <div class=\"u-gutt-3\" repeat.for=\"emailInfo of vm.user.emailInfos\">\n                        <div class=\"form-row\">\n                            <label for=\"challenge-with-${emailInfo.label}-input\">${emailInfo.label}</label>\n                            <input type=\"radio\" id=\"challenge-with-${emailInfo.label}-input\" model.bind=\"emailInfo\" checked.bind=\"vm.selectedEmailAddress & validate\"/>\n                        </div>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/challenge-with-rsa-token/challenge-with-rsa-token.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]challenge-questions_icon\"></i>\n                <span t=\"challenge-with-challenge-questions_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]challenge-with-challenge-questions_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset\">\n                    <validation-summary errors.bind=\"errors\" autofocus.bind=\"controller.validateTrigger === 'manual'\">\n                    </validation-summary>\n                    <div class=\"u-gutt-3\" repeat.for=\"challengeQuestion of vm.user.challengeQuestions\">\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-input-${$index}\" t=\"challenge-question_label\"></label>\n                            <select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=\"challengeQuestion.selectedAvailableChallengeQuestion\">\n                                <option model.bind=\"null\" value=\"\" t=\"challenge-question_option-default\"></option>\n                                <option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=\"availableChallengeQuestion\">${availableChallengeQuestion.challengeQuestionText}</option>\n                            </select>\n                        </div>\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-answer-input-${$index}\" t=\"challenge-question-answer_label\"></label>\n                            <input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=\"[placeholder]challenge-question-answer_placeholder\">\n                        </div>\n                        <div class=\"form-row\">\n                            <input type=\"checkbox\" checked.bind=\"challengeQuestion.showActualAnswer\" id=\"show-actual-answer-input-${$index}\"/>\n                            <label for=\"show-actual-answer-input-${$index}\" t=\"show-actual-answer_label\"></label>\n                        </div>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/challenge-with-phone-info/challenge-with-phone-info.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]challenge-questions_icon\"></i>\n                <span t=\"challenge-with-phone-infos_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]challenge-with-phone-infos_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset login-fieldset\">\n                    <div repeat.for=\"smsInfo of vm.user.smsInfos\" class=\"form-row\">\n                        <label for=\"challenge-with-${smsInfo.label}-input\">${smsInfo.label}</label>\n                        <input type=\"radio\" id=\"challenge-with-${smsInfo.label}-input\" model.bind=\"smsInfo\" checked.bind=\"vm.selectedSmsInfo & validate\"/>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/change-password/change-password.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]service_icon\"></i>\n                <span t=\"change-password_header\"></span>\n            </h3>\n            <h2>\n                <span t=\"signed-in-as_label\" t-params.bind=\"vm.user\"></span>\n            </h2>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]change-password_message\">\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/confirm-dialog/confirm-dialog.html', ['module'], function(module) { module.exports = "<template>\n    <ux-dialog>\n        <ux-dialog-header>\n            <h4>\n                <i t=\"[class]${vm.headerIcon}\"></i>\n                <span t=\"${vm.headerText}\">${vm.headerText}</span>\n            </h4>\n        </ux-dialog-header>\n        <ux-dialog-body>\n            <div t=\"[html]${vm.message}\" t-params.bind=\"vm.messageParams\">${vm.message}</div>\n        </ux-dialog-body>\n        <ux-dialog-footer>\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"${vm.cancelButtonText}\">${vm.cancelButtonText}</span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"confirm($event)\">\n                <span t=\"${vm.confirmButtonText}\">${vm.confirmButtonText}</span>\n            </button>\n        </ux-dialog-footer>\n    </ux-dialog>\n</template>\n"; });
define('text!components/views/edit-credentials/edit-credentials.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <div class=\"button-group expanded\">\n                <button class=\"button\" click.trigger=\"goToEnrollChallengeQuestionAnswers($event)\">\n                    <span t=\"go-to-enroll-challenge-question-answers_button\"></span>\n                </button>\n                <button class=\"button\" click.trigger=\"goToEnrollPhoneInfos($event)\">\n                    <span t=\"go-to-enroll-phone-infos_button\"></span>\n                </button>\n                <button class=\"button\" click.trigger=\"goToEnrollEmailInfos($event)\">\n                    <span t=\"go-to-enroll-email-infos_button\"></span>\n                </button>\n            </div>\n        </div>\n    </div>\n    <compose view-model=\"${editCredentialsViewModel}\" model.bind=\"vm\"></compose>\n</template>\n"; });
define('text!components/views/enroll-challenge-question-answers/enroll-challenge-question-answers.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]challenge-questions_icon\"></i>\n                <span t=\"enroll-challenge-question-answers_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]enroll-challenge-question-answers_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset\">\n                    <validation-summary errors.bind=\"errors\" autofocus.bind=\"controller.validateTrigger === 'manual'\">\n                    </validation-summary>\n                    <div class=\"u-gutt-3\" repeat.for=\"challengeQuestion of vm.user.challengeQuestions\">\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-input-${$index}\" t=\"challenge-question_label\"></label>\n                            <select change.delegate=\"onSelectedAvailableChallengeQuestionAnswerChanged($event, $this, challengeQuestion.selectedAvailableChallengeQuestion)\" id=\"challenge-question-input-${$index}\" value.bind=\"challengeQuestion.selectedAvailableChallengeQuestion\">\n                                <option model.bind=\"null\" value=\"\" t=\"challenge-question_option-default\"></option>\n                                <option repeat.for=\"availableChallengeQuestion of challengeQuestion.availableChallengeQuestions\" model.bind=\"availableChallengeQuestion\">${availableChallengeQuestion.challengeQuestionText}</option>\n                            </select>\n                        </div>\n                        <div class=\"form-row\">\n                            <label for=\"challenge-question-answer-input-${$index}\" t=\"challenge-question-answer_label\"></label>\n                            <input type=\"${challengeQuestion.showActualAnswer ? 'text' : 'password'}\" id=\"challenge-question-answer-input-${$index}\" placeholder=\"challenge question answer\" value.bind=\"challengeQuestion.userAnswerText & validate\" t=\"[placeholder]challenge-question-answer_placeholder\">\n                        </div>\n                        <div class=\"form-row\">\n                            <input type=\"checkbox\" checked.bind=\"challengeQuestion.showActualAnswer\" id=\"show-actual-answer-input-${$index}\"/>\n                            <label for=\"show-actual-answer-input-${$index}\" t=\"show-actual-answer_label\"></label>\n                        </div>\n                    </div>\n                    <div class=\"form-row\">\n                        <button type=\"button\" class=\"button expanded radius\" click.trigger=\"save($event)\">\n                            <span t=\"save_button\"></span>\n                        </button>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enrollment/enroll-credentials.html', ['module'], function(module) { module.exports = "<template>\n    <compose view-model=\"${enrollCredentialsViewModel}\" model.bind=\"vm\"></compose>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-8 columns\">\n            <strong t=\"enrollment-step_header\"></strong>\n        </div>\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"button\" click.trigger=\"skip($event)\" if.bind=\"!enrollCredentialsComplete\">\n                <span t=\"skip_button\"></span>\n            </button>\n        </div>\n        <div class=\"small-12 medium-4 columns\">\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\" if.bind=\"enrollCredentialsComplete\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enrollment/enrollment-disclaimer.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <span t=\"enrollment-disclaimer_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <div t=\"[html]enrollment-disclaimer_message\">\n            </div>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <div class=\"callout warning\">\n                <h4>\n                    <i t=\"[class]incomplete_icon\"></i>\n                    <span t=\"enrollment-incomplete_header\"></span>\n                </h4>\n                <span t=\"[html]enrollment-incomplete_message\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-10 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset disclaimer-fieldset\">\n                    <div class=\"form-row\">\n                        <input id=\"confirm-disclaimer-input\" type=\"checkbox\" value.bind=\"vm.confirmDisclaimerChecked & validate\" checked.bind=\"vm.confirmDisclaimerChecked\">\n                        <label for=\"confirm-disclaimer-input\" t=\"confirm-disclaimer_label\"></label>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n        <div class=\"small-12 medium-2 columns\">\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enrollment/enrollment-intro.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <span t=\"enrollment-intro_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]enrollment-intro_message\">\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 columns\">\n            <button type=\"button\" class=\"button\" click.trigger=\"start($event)\">\n                <span t=\"start_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enrollment/enrollment-review.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <span t=\"enrollment-review_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]enrollment-review_message\">\n        </div>\n    </div>\n    <div class=\"row\" if.bind=\"vm.enrollmentComplete\">\n        <div class=\"small-12 medium-8 columns end\">\n            <div class=\"callout success\">\n                <h4>\n                    <i t=\"[class]complete_icon\"></i>\n                    <span t=\"enrollment-complete_header\"></span>\n                </h4>\n                <span t=\"enrollment-complete_message\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"row\" if.bind=\"!vm.enrollmentComplete\">\n        <div class=\"small-12 medium-8 columns end\">\n            <div class=\"callout warning\">\n                <h4>\n                    <i t=\"[class]incomplete_icon\"></i>\n                    <span t=\"enrollment-incomplete_header\"></span>\n                </h4>\n                <div t=\"[html]enrollment-incomplete_message\"></div>\n            </div>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 columns\">\n            <button type=\"button\" class=\"button\" click.trigger=\"done($event)\">\n                <span t=\"done_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enrollment/enrollment.html', ['module'], function(module) { module.exports = "<template>\n    <compose view-model=\"${enrollmentViewModel}\" model.bind=\"vm\"></compose>\n</template>\n"; });
define('text!components/views/enroll-email-infos/enroll-email-infos.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]email-infos_icon\"></i>\n                <span t=\"enroll-email-infos_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]enroll-email-infos_message\">\n        </div>\n    </div>\n    <div repeat.for=\"emailInfo of vm.user.emailInfos\" class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <span>${emailInfo.emailAddress}</span>\n            <i t=\"[class]complete_icon\"></i>\n            <button type=\"button\" class=\"button hollow alert\" click.trigger=\"removeEmailInfo($event, emailInfo)\">\n                <span t=\"delete_button\"></span>\n            </button>\n        </div>\n    </div>\n    <div if.bind=\"vm.showAddEmailInfoForm\" class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset add-contact-info-fieldset\">\n                    <div class=\"form-row\">\n                        <label for=\"email-address-input\" t=\"email-address_label\"></label>\n                        <input id=\"email-address-input\" type=\"text\" value.bind=\"vm.emailAddress & validate\" focus.bind=\"vm.emailAddressHasFocus\" t=\"[placeholder]email-address_placeholder\">\n                    </div>\n                    <div class=\"form-row\">\n                        <button class=\"button\" click.trigger=\"addEmailInfo($event)\">\n                            <span t=\"add_button\"></span>\n                        </button>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div if.bind=\"!vm.showAddEmailInfoForm\" class=\"row\">\n        <div class=\"small-12 columns\">\n            <button type=\"button\" class=\"link\" click.delegate=\"showAddEmailInfoForm($event)\">\n                <i t=\"[class]add_icon\"></i>\n                <span t=\"show-add-email-info_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/enroll-phone-infos/enroll-phone-infos.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]phone-infos_icon\"></i>\n                <span t=\"enroll-phone-infos_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]enroll-phone-infos_message\">\n        </div>\n    </div>\n    <div repeat.for=\"smsInfo of vm.user.smsInfos\" class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <span>${smsInfo.phoneNumber | phoneFormatter}</span>\n            <i t=\"[class]complete_icon\"></i>\n            <button type=\"button\" class=\"button hollow alert\" click.trigger=\"removePhoneInfo($event, smsInfo)\">\n                <span t=\"delete_button\"></span>\n            </button>\n        </div>\n    </div>\n    <div if.bind=\"vm.showAddPhoneInfoForm\" class=\"row\">\n        <div class=\"small-12 columns\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset add-contact-info-fieldset\">\n                    <div class=\"form-row\">\n                        <label for=\"phone-number-input\" t=\"phone-number_label\"></label>\n                        <input id=\"phone-number-input\" type=\"text\" value.bind=\"vm.phoneNumber | phoneFormatter & validate\" focus.bind=\"vm.phoneNumberHasFocus\" t=\"[placeholder]phone-number_placeholder\" maxlength=\"16\">\n                    </div>\n                    <div class=\"form-row\">\n                        <button class=\"button\" click.trigger=\"addPhoneInfo($event)\">\n                            <span t=\"add_button\"></span>\n                        </button>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div if.bind=\"!vm.showAddPhoneInfoForm\" class=\"row\">\n        <div class=\"small-12 columns\">\n            <button type=\"button\" class=\"link\" click.delegate=\"showAddPhoneInfoForm($event)\">\n                <i t=\"[class]add_icon\"></i>\n                <span t=\"show-add-phone-info_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/login/challenge-with-credentials.html', ['module'], function(module) { module.exports = "<template>\n    <compose view-model=\"${challengeWithCredentialsViewModel}\" model.bind=\"vm\"></compose>\n</template>\n"; });
define('text!components/views/login/challenge.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]security_icon\"></i>\n                <span t=\"challenge_header\"></span>\n            </h3>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns end\" t=\"[html]challenge_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset u-gutt-3\">\n                    <div class=\"u-gutt-3\" repeat.for=\"credentialType of vm.user.availableChallengeCredentialTypes\">\n                        <div class=\"form-row\">\n                            <label for=\"challenge-with-${credentialType}-input\" t=\"challenge-with-${credentialType}_label\"></label>\n                            <input type=\"radio\" id=\"challenge-with-${credentialType}-input\" model.bind=\"credentialType\" checked.bind=\"vm.selectedCredentialType & validate\"/>\n                        </div>\n                    </div>\n                </fieldset>\n                <fieldset class=\"fieldset\">\n                    <legend t=\"bind-device_header\"></legend>\n                    <div class=\"u-gutt-3\" repeat.for=\"option of vm.bindDeviceOptions\">\n                        <div class=\"form-row\">\n                            <label for=\"bind-device-${option}-input\" t=\"bind-device-${option}_label\"></label>\n                            <input id=\"bind-device-${option}-input\" type=\"radio\" model.bind=\"option\" checked.bind=\"vm.bindDevice\"/>\n                        </div>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row c-action-bar\">\n        <div class=\"small-12 medium-8 columns end\">\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button type=\"button\" class=\"button\" click.trigger=\"next($event)\">\n                <span t=\"next_button\"></span>\n            </button>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/login/deny.html', ['module'], function(module) { module.exports = "<template>\n</template>\n"; });
define('text!components/views/login/login.html', ['module'], function(module) { module.exports = "<template>\n    <compose view-model=\"${loginViewModel}\" model.bind=\"vm\"></compose>\n</template>\n"; });
define('text!components/views/login/network-credentials.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                <fieldset class=\"fieldset login-fieldset\">\n                    <validation-summary errors.bind=\"errors\" autofocus.bind=\"controller.validateTrigger === 'manual'\">\n                    </validation-summary>\n                    <div class=\"form-row\">\n                        <label for=\"user-id-input\" t=\"user-id_label\"></label>\n                        <input id=\"user-id-input\" type=\"text\" value.bind=\"vm.user.userId & validate\" focus.bind=\"vm.userIdHasFocus\" t=\"[placeholder]user-id_placeholder\">\n                    </div>\n                    <div class=\"form-row\">\n                        <label for=\"credentials-input\" t=\"credentials_label\"></label>\n                        <input id=\"credentials-input\" type=\"password\" value.bind=\"vm.user.credentials & validate\" focus.bind=\"vm.credentialsHasFocus\" keypressInput.bind=\"keypressInput($event)\" t=\"[placeholder]credentials_placeholder\">\n                    </div>\n                    <div class=\"form-row\">\n                        <button type=\"button\" class=\"button expanded radius\" click.trigger=\"signin($event)\">\n                            <span t=\"signin_button\"></span>\n                        </button>\n                    </div>\n                    <div class=\"form-row\">\n                        <button type=\"button\" class=\"button expanded hollow\" click.trigger=\"goToForgotPassword($event)\">\n                            <span t=\"go-to-forgot-password_button\"></span>\n                        </button>\n                    </div>\n                </fieldset>\n            </form>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <span class=\"text-center disclaimer\" t=\"disclaimer_message\">\n            </span>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/logout/logout.html', ['module'], function(module) { module.exports = "<template>\n</template>\n"; });
define('text!components/views/self-service/self-service.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]service_icon\"></i>\n                <span t=\"self-service_header\"></span>\n            </h3>\n            <h2>\n                <span t=\"signed-in-as_label\"></span><span>${vm.user.userId}</span>\n            </h2>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]self-service_message\">\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 columns\">\n            <div class=\"button-group expanded\">\n                <button class=\"button button--full\" click.trigger=\"goToChangePassword($event)\">\n                    <span class=\"u-dis-b text-center\">\n                        <i t=\"[class]change-password_icon\"></i>\n                    </span>\n                    <span class=\"u-lh-lg text-center\">\n                        <span t=\"go-to-change-password_button\"></span>\n                    </span>\n                </button>\n                <button class=\"button button--full\" click.trigger=\"goToEditProfile($event)\">\n                    <span class=\"u-dis-b text-center\">\n                        <i t=\"[class]profile_icon\"></i>\n                    </span>\n                    <span class=\"u-lh-lg text-center\">\n                        <span t=\"go-to-edit-profile_button\"></span>\n                    </span>\n                </button>\n                <button class=\"button button--full\" click.trigger=\"goToUnlockAccount($event)\">\n                    <span class=\"u-dis-b text-center\">\n                        <i t=\"[class]unlock_icon\"></i>\n                    </span>\n                    <span class=\"u-lh-lg text-center\">\n                        <span t=\"go-to-unlock-account_button\"></span>\n                    </span>\n                </button>\n            </div>\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/unlock-account/unlock-account.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\">\n            <h3>\n                <i t=\"[class]service_icon\"></i>\n                <span t=\"unlock-account_header\"></span>\n            </h3>\n            <h2>\n                <span t=\"signed-in-as_label\" t-params.bind=\"vm.user\"></span>\n            </h2>\n        </div>\n    </div>\n    <div class=\"row\">\n        <div class=\"small-12 medium-8 columns end\" t=\"[html]unlock-account_message\">\n        </div>\n    </div>\n</template>\n"; });
define('text!components/views/verify-email-info-dialog/verify-email-info-dialog.html', ['module'], function(module) { module.exports = "<template>\n    <ux-dialog>\n        <ux-dialog-header>\n            <h3>\n                <i t=\"[class]verify-email-info_icon\"></i>\n                <span t=\"verify-email-info_header\"></span>\n            </h3>\n        </ux-dialog-header>\n        <ux-dialog-body>\n            <div class=\"row\">\n                <div class=\"small-12 columns\" t=\"[html]verify-email-info_message\" t-params.bind=\"vm.messageParams\">\n                </div>\n            </div>\n            <div if.bind=\"!vm.eventTimerExpired\" class=\"row\">\n                <div class=\"small-12 columns\">\n                    <span t=\"remaining-time_label\"></span><span>${vm.remainingTime | timerFormatter}</span>\n                </div>\n            </div>\n            <div if.bind=\"vm.eventTimerExpired\" class=\"row\">\n                <div class=\"small-12 columns\" t=\"[html]verification-code-expired_message\">\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"small-12 columns\">\n                    <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                        <fieldset class=\"fieldset\">\n                            <div class=\"form-row\">\n                                <label for=\"verification-code-input\" t=\"verification-code_label\"></label>\n                                <input id=\"verification-code-input\" type=\"text\" autocomplete=\"off\" value.bind=\"vm.verificationCode & validate\" attach-focus.bind=\"vm.verificationCodeHasFocus\" t=\"[placeholder]verification-code_placeholder\">\n                            </div>\n                        </fieldset>\n                    </form>\n                </div>\n            </div>\n        </ux-dialog-body>\n        <ux-dialog-footer>\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button if.bind=\"vm.eventTimerExpired\" type=\"button\" class=\"hollow button\" click.trigger=\"resend($event)\">\n                <span t=\"resend-code_button\"></span>\n            </button>\n            <button if.bind=\"!vm.eventTimerExpired\" type=\"button\" class=\"hollow button\" click.trigger=\"verify($event)\">\n                <span t=\"verify_button\"></span>\n            </button>\n        </ux-dialog-footer>\n    </ux-dialog>\n</template>\n"; });
define('text!components/views/verify-phone-info-dialog/verify-phone-info-dialog.html', ['module'], function(module) { module.exports = "<template>\n    <ux-dialog>\n        <ux-dialog-header>\n            <h3>\n                <i t=\"[class]verify-phone-info_icon\"></i>\n                <span t=\"verify-phone-info_header\"></span>\n            </h3>\n        </ux-dialog-header>\n        <ux-dialog-body>\n            <div class=\"row\">\n                <div class=\"small-12 columns\" t=\"[html]verify-phone-info_message\" t-params.bind=\"vm.messageParams\">\n                </div>\n            </div>\n            <div if.bind=\"!vm.eventTimerExpired\" class=\"row\">\n                <div class=\"small-12 columns\">\n                    <span t=\"remaining-time_label\"></span><span>${vm.remainingTime | timerFormatter}</span>\n                </div>\n            </div>\n            <div if.bind=\"vm.eventTimerExpired\" class=\"row\">\n                <div class=\"small-12 columns\" t=\"[html]verification-code-expired_message\">\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"small-12 columns\">\n                    <form validation-renderer=\"foundation-form\" validation-errors.bind=\"errors\">\n                        <fieldset class=\"fieldset\">\n                            <div class=\"form-row\">\n                                <label for=\"verification-code-input\" t=\"verification-code_label\"></label>\n                                <input id=\"verification-code-input\" type=\"text\" autocomplete=\"off\" value.bind=\"vm.verificationCode & validate\" attach-focus.bind=\"vm.verificationCodeHasFocus\" t=\"[placeholder]verification-code_placeholder\">\n                            </div>\n                        </fieldset>\n                    </form>\n                </div>\n            </div>\n        </ux-dialog-body>\n        <ux-dialog-footer>\n            <button type=\"button\" class=\"hollow button\" click.trigger=\"cancel($event)\">\n                <span t=\"cancel_button\"></span>\n            </button>\n            <button if.bind=\"vm.eventTimerExpired\" type=\"button\" class=\"hollow button\" click.trigger=\"resend($event)\">\n                <span t=\"resend-code_button\"></span>\n            </button>\n            <button if.bind=\"!vm.eventTimerExpired\" type=\"button\" class=\"hollow button\" click.trigger=\"verify($event)\">\n                <span t=\"verify_button\"></span>\n            </button>\n        </ux-dialog-footer>\n    </ux-dialog>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map