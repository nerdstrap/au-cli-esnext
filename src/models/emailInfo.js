export class EmailInfo {
    emailAddress ='';
    label = '';
    isDefault = false;
    verified = false;
    hasActiveToken = false;

    constructor() {
    }

    fromJson(response) {
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
    }
}
