export class DeviceHelper {

    constructor() {
    }

    get deviceRequest() {
        let devicePrint = encode_deviceprint();

        //Gather existing token value from cookie
        let deviceTokenCookie = this.deviceTokenCookie;

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

    setDeviceTokenCookie(cDeviceToken) {
        let cname = "PMData";
        let cmaxage = 365;
        let d = new Date();
        d.setTime(d.getTime() + (cmaxage * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cDeviceToken + ";" + expires + ";path=/;";
    }

    get deviceTokenCookie() {
        let cname = "PMData=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(cname) === 0) {
                return c.substring(cname.length, c.length);
            }
        }
        return "";
    }
}
