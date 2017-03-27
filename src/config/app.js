export default {
    app: {
        title: 'Corporation Name\'s Self Service Password Reset',
        environment: 'development',
    },
    logger: {
        name: 'au-cli-esnext'
    },
    i18n: {
        debug: true
    },
    'aurelia-api': {
        endpoints: [
            {
                name: 'user',
                endpoint: 'http://127.0.0.1:1337/user/',
                // config  : {},
                default: true
            },
            {
                name: 'auth',
                endpoint: 'http://127.0.0.1:1337/',
                // config  : {}
            }
        ],
    },
    defaultLocale: {
        language: 'en',
        locale: 'en-US'
    },
    'aurelia-notification': {
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
        verifyEmailInfoTimerStartTime: 120
    }
};
