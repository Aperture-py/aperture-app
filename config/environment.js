'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'aperture-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV['ember-toastr'] = {
    injectAs: 'toast',
    toastrOptions: {
      closeButton: false,
      debug: false,
      newestOnTop: true,
      progressBar: false,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      onclick: null,
      showDuration: '300',
      hideDuration: '300',
      timeOut: '3000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.API_URL = 'http://localhost:5000';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.APP.API_URL = 'https://api.aperture.run';
  }

  ENV.contentSecurityPolicy = {
    'default-src': ["'none'"],
    'script-src': ["'self' 'unsafe-inline'"], // unfortunately need inline in order for the ember app to work
    'font-src': ["'self' https://fonts.gstatic.com"],
    'connect-src': ["'self'"],
    'img-src': ["'self'"],
    'style-src': ["'self' https://fonts.googleapis.com"],
    'media-src': ["'self'"]
  };
  ENV.contentSecurityPolicyMeta = true;

  return ENV;
};
