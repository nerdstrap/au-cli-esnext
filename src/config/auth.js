export default {
    /* @see http://aurelia-authentication.spoonx.org/configuration.html */
    'aurelia-authentication': {
        // Which endpoint (in `./app.js`) to use for auth requests.
        endpoint: 'auth',

        // Which endpoints to patch with the JWT (Authorization header).
        configureEndpoints: ['auth', 'user'],

        // The base url used for all authentication related requests, including provider.url below.
        // This appends to the httpClient/endpoint base url (in `./app.js`), it does not override it.
        baseUrl: 'auth',

        // The API endpoint to which login requests are sent
        loginUrl: '/login',

        // The API endpoint to which signup requests are sent
        signupUrl: '/signup',

        // Redirect to this url after successfully logging in
        loginRedirect: '/#/self-service',

        // The API endpoint used in profile requests (inc. `find/get` and `update`)
        profileUrl: '/me',

        accessTokenProp: 'access_token',
        refreshTokenProp: 'refresh_token',
        idTokenProp: 'id_token',
        refreshTokenSubmitProp: 'refresh_token',
        refreshTokenUrl: '/refresh-token',
        useRefreshToken: true
    }
};
