/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Auth broker to handle users who browse directly to the site.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BaseBroker = require('models/auth_brokers/base');
  const { CONTENT_SERVER_CONTEXT } = require('lib/constants');
  const NavigateBehavior = require('views/behaviors/navigate');

  const t = (msg) => msg;

  const proto = BaseBroker.prototype;

  const redirectToSettingsBehavior = new NavigateBehavior('settings', {
    success: t('Account verified successfully')
  });

  function redirectToSettingsIfSignedIn(brokerMethod) {
    return function (account) {
      return proto[brokerMethod].call(this, account)
        .then((defaultBehavior) => {
          return account.isSignedIn()
            .then((isSignedIn) => {
              if (isSignedIn) {
                return redirectToSettingsBehavior;
              } else {
                return defaultBehavior;
              }
            });
        });
    };
  }

  module.exports = BaseBroker.extend({
    afterCompleteAddSecondaryEmail: redirectToSettingsIfSignedIn('afterCompleteAddSecondaryEmail'),
    afterCompleteSignIn: redirectToSettingsIfSignedIn('afterCompleteSignIn'),
    afterCompleteSignUp: redirectToSettingsIfSignedIn('afterCompleteSignUp'),

    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      afterCompleteResetPassword: redirectToSettingsBehavior,
      afterResetPasswordConfirmationPoll: redirectToSettingsBehavior,
      afterSignInConfirmationPoll: redirectToSettingsBehavior,
      afterSignUpConfirmationPoll: redirectToSettingsBehavior
    }),

    type: CONTENT_SERVER_CONTEXT
  });
});
