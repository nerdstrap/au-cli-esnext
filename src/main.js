import routerConfig from 'config/router';
import appConfig from 'config/app';
import authConfig from 'config/auth';
import localConfig from 'config/local';
import Backend from 'i18next-xhr-backend';
import {Config} from 'aurelia-config';
import {Router} from 'aurelia-router';
import {AuthenticateStep} from 'aurelia-authentication';
import {ValidationMessageProvider} from 'aurelia-validation';
import {LogManager} from 'aurelia-framework';
import {ConsoleAppender} from 'aurelia-logging-console';

LogManager.addAppender(new ConsoleAppender());
LogManager.setLevel(window.location.hostname.match(new RegExp('localhost'))
    ? LogManager.logLevel.debug
    : LogManager.logLevel.error);

Promise.config({
    warnings: {
        wForgottenReturn: false
    }
});

function getLanguage() {
    return new Promise((resolve) => {
        let lng = 'en';
        resolve(lng);
    });
}

function configureRouter(config) {
    config.title = appConfig.app.title;
    config.addPipelineStep('authorize', AuthenticateStep);
    config.map(routerConfig.routes);
    config.fallbackRoute(routerConfig.fallbackRoute);
}

function setRoot(aurelia) {
    if (aurelia.setupAureliaDone && aurelia.setupI18NDone) {
        aurelia.container.get(Router).configure(configureRouter);
        aurelia.setRoot('app/app');
    }
}

function initialize(aurelia, lng) {
    aurelia.setupAureliaDone = false;
    aurelia.setupI18NDone = false;
    aurelia.use
        .standardConfiguration()
        .feature('foundation-validation')
        .feature('resources')
        .feature('components')
        .plugin('aurelia-validation')
        .plugin('aurelia-config', configure => {
            return configure([
                'aurelia-api',
                'aurelia-authentication',
                'aurelia-notification'
            ], appConfig, authConfig, localConfig);
        })
        .plugin('aurelia-dialog', config => {
            config.useDefaults();
            config.useCSS('');
            config.settings.lock = true;
            config.settings.centerHorizontalOnly = false;
            config.settings.startingZIndex = 5;
            config.settings.enableEscClose = true;
            config.settings.rejectOnCancel = true;
        })
        .plugin('aurelia-i18n', instance => {
            instance.i18next.use(Backend);
            let language = localStorage.getItem('language');
            instance.setup({
                backend: {
                    loadPath: 'src/locales/{{lng}}/{{ns}}.json'
                },
                lng: language || appConfig.defaultLocale.language,
                attributes: ['t'],
                fallbackLng: language || appConfig.defaultLocale.language,
                debug: appConfig.i18n.debug,
                interpolation: {
                    format: function (value, format, lng) {
                        const parts = format.split(':');
                        const vc = aurelia.resources.valueConverters[parts.shift()];
                        return vc ? vc.toView(value, ...parts) : value;
                    }
                }
            }).then(() => {
                ValidationMessageProvider.prototype.getMessage = function (key) {
                    const translation = instance.i18next.t(`validationMessages.${key}`);
                    return this.parser.parseMessage(translation);
                };
                ValidationMessageProvider.prototype.getDisplayName = function (propertyName, displayName) {
                    if (displayName !== null && displayName !== undefined) {
                        return displayName;
                    }
                    return instance.i18next.t(`inputParameters.${propertyName}`);
                };
                aurelia.setupI18NDone = true;
                setRoot(aurelia);
            });
        });

    let mergedConfig = aurelia.container.get(Config);
    if (mergedConfig.fetch('environment') === 'development') {
        aurelia.use.developmentLogging();
    }

    if (mergedConfig.fetch('environment') === 'testing') {
        aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(() => {
        aurelia.setupAureliaDone = true;
        setRoot(aurelia);
    });
}

export function configure(aurelia) {
    getLanguage().then(lang => {
        initialize(aurelia, lang);
    }).catch(e => {
        initialize(aurelia, 'en');
    });
}
