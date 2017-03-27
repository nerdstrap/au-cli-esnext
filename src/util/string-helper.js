import moment from 'moment';
import {logger} from 'util/logger-helper';

function StringHelperFunction() {
    return {
        formatDate: function(date) {
            let formattedDate = '';
            if (date) {
                try {
                    let d = new Date(date);
                    formattedDate = moment(d).format('MM/DD/YYYY');
                } catch (dateErr) {
                    logger.warn("Invalid value for view:" + value, dateErr);
                }
            }
            if (formattedDate === 'Invalid date') { // this will force the text to be "" for invalid dates
                formattedDate = null;
            }
            return formattedDate;
        },

        parseDate: function(date) {
            let parsedDate = '';
            if (date) {
                if (date === 'Invalid date') { // this will force the text to be "" for invalid dates
                    return null;
                }
                try {
                    parsedDate = moment(new Date(date)).format('YYYY-MM-DDTHH:mm:ssZ');
                } catch (dateErr) {
                    parsedDate = null;
                    logger.warn("invalid value from view: " + value, dateErr);
                }
            }
            return parsedDate;
        },

        formatPhoneNumber: function(phoneNumber) {
            let formattedPhoneNumber = '';
            if (phoneNumber) {
                let rawPhoneNumber = phoneNumber.replace(/\D/g,'');
                let size = rawPhoneNumber.length;
    
                if(size > 10)
                {
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

        parsePhoneNumber: function(phoneNumber) {
            let parsedPhoneNumber = '';
            if (phoneNumber) {
                parsedPhoneNumber = phoneNumber.replace(/\D/g,'').substring(0,10);
            }
            return parsedPhoneNumber;
        }
    };
}

export let StringHelper = new StringHelperFunction();
