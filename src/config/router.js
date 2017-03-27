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
            route: '/self-service/edit-profile',
            name: 'edit-profile',
            moduleId: 'components/views/edit-profile/edit-profile',
            nav: false,
            auth: true,
            title: 'Edit Profile',
            settings: {
                t: 'edit-profile_route',
                roles: []
            }
        }, {
            route: '/self-service/edit-challenge-question-answers',
            name: 'edit-challenge-question-answers',
            moduleId: 'components/views/edit-challenge-question-answers/edit-challenge-question-answers',
            nav: false,
            auth: true,
            title: 'Edit Challenge Question Answers',
            settings: {
                t: 'edit-challenge-question-answers_route',
                roles: []
            }
        }, {
            route: '/self-service/edit-phone-infos',
            name: 'edit-phone-infos',
            moduleId: 'components/views/edit-phone-infos/edit-phone-infos',
            nav: false,
            auth: true,
            title: 'Edit Phone Infos',
            settings: {
                t: 'edit-phone-infos_route',
                roles: []
            }
        }, {
            route: '/self-service/edit-email-infos',
            name: 'edit-email-infos',
            moduleId: 'components/views/edit-email-infos/edit-email-infos',
            nav: false,
            auth: true,
            title: 'Edit Email Infos',
            settings: {
                t: 'edit-email-infos_route',
                roles: []
            }
        }],
    fallbackRoute: 'login'
};
