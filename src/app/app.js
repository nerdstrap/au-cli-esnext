import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthService} from 'aurelia-authentication';
import {AureliaUX} from 'aurelia-ux';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {logger} from 'util/logger-helper';
import $ from 'jquery';
import foundation from 'foundation-sites';

@inject(Router, AuthService, AureliaUX, Notification, I18N)
export class App {

    languages = [
        {code: 'en', locale: 'en-US', flag: 'us'}
    ];

    constructor(router, authService, ux, notification, i18n) {
        this.router = router;
        this.authService = authService;
        this.ux = ux;
        this.notification = notification;
        this.i18n = i18n;

        let payload = authService.getTokenPayload();
        this.username = payload ? payload.username : null;
        this.authenticated = this.authService.isAuthenticated();
    }

    setLanguage(language) {
        localStorage.setItem('language', language.code);
        window.top.location.reload();
    }

    attached() {
        ux.design.primary = '#704794';
        ux.design.accent = '#e62787';
        logger.info(this.i18n.tr('welcome_notification'));
        this.notification.info('welcome_notification');
    }
}
