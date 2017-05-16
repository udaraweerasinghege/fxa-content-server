/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const defaultBehaviors = require('models/auth_brokers/base').prototype.defaultBehaviors;
  const p = require('lib/promise');
  const sinon = require('sinon');
  const WebBroker = require('models/auth_brokers/web');

  describe('models/auth_brokers/web', function () {
    let broker;

    beforeEach(() => {
      broker = new WebBroker({ metrics: { logEvent: sinon.spy() }});
    });

    function testRedirectsToSettings(brokerMethod) {
      describe(brokerMethod, () => {
        it('returns a NavigateBehavior to settings', () => {
          return broker[brokerMethod]({ get: () => {} })
            .then((behavior) => {
              assert.equal(behavior.type, 'navigate');
              assert.equal(behavior.endpoint, 'settings');
            });
        });
      });
    }

    function testRedirectsToSettingsIfSignedIn(brokerMethod) {
      describe(brokerMethod, () => {
        it('user is signed in - redirects to settings', () => {
          return broker[brokerMethod]({ get: () => {}, isSignedIn: () => p(true) })
            .then((behavior) => {
              assert.equal(behavior.type, 'navigate');
              assert.equal(behavior.endpoint, 'settings');
            });
        });

        it('user is not signed in - returns default behavior', () => {
          return broker[brokerMethod]({ get: () => {}, isSignedIn: () => p(false) })
            .then((behavior) => {
              assert.strictEqual(behavior, defaultBehaviors[brokerMethod]);
            });
        });
      });
    }

    testRedirectsToSettings('afterCompleteResetPassword');
    testRedirectsToSettings('afterResetPasswordConfirmationPoll');
    testRedirectsToSettings('afterSignInConfirmationPoll');
    testRedirectsToSettings('afterSignUpConfirmationPoll');

    testRedirectsToSettingsIfSignedIn('afterCompleteAddSecondaryEmail');
    testRedirectsToSettingsIfSignedIn('afterCompleteSignIn');
    testRedirectsToSettingsIfSignedIn('afterCompleteSignUp');
  });
});


