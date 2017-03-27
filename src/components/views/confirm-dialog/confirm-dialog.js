import {inject, bindable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogController} from 'aurelia-dialog';
import {Notification} from 'aurelia-notification';
import {I18N} from 'aurelia-i18n';
import {AuthService} from 'aurelia-authentication';
import {UserService} from 'services/user-service';
import {logger} from 'util/logger-helper';

@inject(DialogController, EventAggregator, Notification, I18N, AuthService, UserService)
export class ConfirmDialog {
    vm = {
        headerIcon: '',
        headerText: '',
        message: '',
        messageParams: {},
        cancelButtonText: '',
        confirmButtonText: '',
    };

    constructor(dialogController, eventAggregator, notification, i18n, authService, userService) {
        this.dialogController = dialogController;
        this.eventAggregator = eventAggregator;
        this.notification = notification;
        this.i18n = i18n;
        this.authService = authService;
        this.userService = userService;
    }

    activate(viewModel) {
        this.vm = viewModel;
    }

    confirm(event) {
        this.dialogController.ok();
    }

    cancel(event) {
        this.dialogController.cancel();
    }
}
