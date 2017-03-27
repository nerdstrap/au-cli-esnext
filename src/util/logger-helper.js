import {LogManager} from 'aurelia-framework';
import appConfig from 'config/app';

export let logger = LogManager.getLogger(appConfig.logger.name);
