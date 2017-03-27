export class SmsInfo {
    phoneNumber ='';
    label = '';
    isDefault = false;
    verified = false;
    hasActiveToken = false;

    constructor() {
    }

    fromJson(response) {
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
    }
}
