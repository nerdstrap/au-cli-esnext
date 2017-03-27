function LocationHelperFunction() {
    return {
        getQueryParameter: function (key, default_) {
            if (default_ == null) {
                default_ = null;
            }
            key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            key = key.replace("$", "\\$");
            let regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
            let qs = regex.exec(window.location.href);
            if (qs == null) {
                return default_;
            } else {
                return decodeURIComponent(qs[1]);
            }
        }
    };
}

export let LocationHelper = new LocationHelperFunction();
