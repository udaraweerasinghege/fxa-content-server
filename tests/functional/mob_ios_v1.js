/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Functional suite for the mob_ios_v1 broker. There are no "verify same browser" tests
 * because it's impossible to open the verification link in the app where the verification
 * was triggered.
 */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  'use strict';

  const config = intern.config;

  const SIGNIN_PAGE_URL = `${config.fxaContentRoot}signin?context=mob_ios_v1&service=sync`;
  const SIGNUP_PAGE_URL = `${config.fxaContentRoot}signup?context=mob_ios_v1&service=sync`;

  const COMMAND_CAN_LINK_ACCOUNT = 'fxaccounts:can_link_account';
  const COMMAND_EMAIL_VERIFIED = 'fxaccounts:email_verified';
  const COMMAND_LOADED = 'fxaccounts:loaded';
  const COMMAND_LOGIN = 'fxaccounts:login';

  let email;
  const PASSWORD = '12345678';

  const createUser = FunctionalHelpers.createUser;
  const fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const noSuchElement = FunctionalHelpers.noSuchElement;
  const noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInDifferentBrowser = FunctionalHelpers.openVerificationLinkInDifferentBrowser;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'mob_ios_v1',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(FunctionalHelpers.clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(FunctionalHelpers.clearBrowserState());
    },

    'signup, verify different browser': function () {
      return this.remote
        .then(openPage(SIGNUP_PAGE_URL, selectors.SIGNUP.HEADER, {
          webChannelResponses: {
            [COMMAND_CAN_LINK_ACCOUNT]: { ok: true }
          }
        }))
        .then(noSuchElement(selectors.SIGNUP.CUSTOMIZE_SYNC_CHECKBOX))
        .then(testIsBrowserNotified(COMMAND_LOADED))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(testIsBrowserNotified(COMMAND_CAN_LINK_ACCOUNT))
        .then(noSuchBrowserNotification(COMMAND_EMAIL_VERIFIED))
        .then(testIsBrowserNotified(COMMAND_LOGIN))

        // verify the user
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
        .then(testIsBrowserNotified(COMMAND_EMAIL_VERIFIED));
    },

    'signin, verify different browser': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(SIGNIN_PAGE_URL, selectors.SIGNIN.HEADER, {
          webChannelResponses: {
            [COMMAND_CAN_LINK_ACCOUNT]: { ok: true }
          }
        }))
        .then(testIsBrowserNotified(COMMAND_LOADED))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified(COMMAND_LOGIN))
        .then(testIsBrowserNotified(COMMAND_CAN_LINK_ACCOUNT))
        .then(noSuchBrowserNotification(COMMAND_EMAIL_VERIFIED))

        // verify the user
        .then(openVerificationLinkInDifferentBrowser(email, 0))

        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
        .then(testIsBrowserNotified(COMMAND_EMAIL_VERIFIED));
    }
  });
});
