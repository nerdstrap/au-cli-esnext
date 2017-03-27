export class WindowHelper {
    
    constructor() {
    }

    addEventListener(type, listener, options) {
        if (window && window.addEventListener) {
            window.addEventListener(type, listener, options);
        }
    }
    removeEventListener(type, listener, options, useCapture) {
        if (window && window.removeEventListener) {
            window.removeEventListener(type, listener, options);
        }
    }
}
