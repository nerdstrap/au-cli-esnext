export default {
    routes: [
        {
            route: ['', '/login'],
            name: 'login',
            moduleId: 'components/views/login/login',
            nav: false,
            auth: false,
            title: 'Login',
            settings: {
                t: 'login_route',
                roles: []
            }
        }, {
            route: '/logout',
            name: 'logout',
            moduleId: 'components/views/logout/logout',
            title: 'Logout',
            settings: {
                t: 'logout_route',
                roles: []
            }
        }, {
            route: '/enrollment',
            name: 'enrollment',
            moduleId: 'components/views/enrollment/enrollment',
            nav: false,
            auth: true,
            title: 'Enrollment',
            settings: {
                t: 'enrollment_route',
                roles: ['notenrolled']
            }
        }, {
            route: '/challenge',
            name: 'challenge',
            moduleId: 'components/views/challenge/challenge',
            nav: false,
            auth: true,
            title: 'Challenge',
            settings: {
                t: 'challenge_route',
                roles: []
            }
        }, {
            route: '/self-service',
            name: 'self-service',
            moduleId: 'components/views/self-service/self-service',
            nav: false,
            auth: true,
            title: 'Self Service',
            settings: {
                t: 'self-service_route',
                roles: []
            }
        }, {
            route: '/self-service/change-password',
            name: 'change-password',
            moduleId: 'components/views/change-password/change-password',
            nav: false,
            auth: true,
            title: 'Change Password',
            settings: {
                t: 'change-password_route',
                roles: []
            }
        }, {
            route: '/self-service/unlock-profile',
            name: 'unlock-profile',
            moduleId: 'components/views/unlock-profile/unlock-profile',
            nav: false,
            auth: true,
            title: 'Unlock Profile',
            settings: {
                t: 'unlock-profile_route',
                roles: []
            }
        }, {
            route: '/self-service/edit-credentials',
            name: 'edit-profile',
            moduleId: 'components/views/edit-credentials/edit-credentials',
            nav: false,
            auth: true,
            title: 'Edit Credentials',
            settings: {
                t: 'edit-credentials_route',
                roles: []
            }
        }],
    fallbackRoute: 'login'
};
