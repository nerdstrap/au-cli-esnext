import {inject, bindable, computedFrom} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {ConfirmDialog} from 'components/views/confirm-dialog/confirm-dialog';
import {logger} from 'util/logger-helper';

@inject(Router, EventAggregator, DialogService, Notification, I18N, AuthService, UserService)
export class NavBar {
    @bindable router = null;
    @bindable username = null;

    constructor(router, eventAggregator, dialogService, notification, i18n, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
    }

    get isAuthenticated() {
        return this.authService.isAuthenticated();
    }

    goToLogout() {
        let confirmDialogModel = this.i18n.tr('logout-dialog', {returnObjects: true});

        this.dialogService.open({viewModel: ConfirmDialog, model: confirmDialogModel, rejectOnCancel: false})
            .whenClosed(openDialogResult => {
                if (!openDialogResult.wasCancelled) {
                    this.router.navigateToRoute('logout');
                }
            })
            .catch(reason => {
                logger.error(reason);
                this.notification.error('logout_error');
            });
    }

}
