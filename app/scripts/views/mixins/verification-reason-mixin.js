/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper methods to determine why a user must verify
 *
 * @class VerificationReasonMixin
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const VerificationReasons = require('lib/verification-reasons');

  function findKey(haystack, needle) {
    return _.findKey(haystack, function (value) {
      return value === needle;
    });
  }

  module.exports = {
    initialize (options) {
      if (! this.model.has('type')) {
        this.model.set('type', options.type || VerificationReasons.SIGN_UP);
      }
    },

    /**
     * Check if verification is for sign in
     *
     * @returns {Boolean}
     */
    isSignIn () {
      return this.model.get('type') === VerificationReasons.SIGN_IN;
    },

    /**
     * Check if verification is for sign up
     *
     * @returns {Boolean}
     */
    isSignUp () {
      return this.model.get('type') === VerificationReasons.SIGN_UP;
    },

    /**
     * Check if verification is to verify a secondary email
     *
     * @returns {Boolean}
     */
    isVerifySecondaryEmail () {
      return this.model.get('type') === VerificationReasons.SECONDARY_EMAIL_VERIFIED;
    },

    /**
     * Get the key in VerificationReasons for the given verification reason
     *
     * @param {String} verificationReason
     * @returns {String}
     */
    keyOfVerificationReason (verificationReason) {
      return findKey(VerificationReasons, verificationReason);
    }
  };
});
