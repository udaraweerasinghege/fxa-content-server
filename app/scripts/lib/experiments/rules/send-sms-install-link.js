/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  function isEmailInTreatment (email) {
    return /@softvision\.(com|ro)$/.test(email) ||
           /@mozilla\.(com|org)$/.test(email);
  }

  module.exports = {
    name: 'sendSms',
    choose (subject) {
      function isInExperiment (forceExperiment, email) {
        return forceExperiment === 'sendSms' || isEmailInTreatment(email);
      }

      if (! subject || ! subject.account || ! subject.uniqueUserId) {
        return false;
      }

      if (isInExperiment(subject.forceExperiment, subject.account.get('email'))) {
        return this.groupingFunction(subject);
      }

      // enable for everyone who reports metrics to DataDog - 10% of the population
      // + 40 extra percent of the population who are not reporting to DataDog, for
      // a total of 50%.
      //
      // Getting 50% total percent when 10% is already chosen and selections
      // are independent is a bit strange. We start with the 10% that report
      // to DataDog, then add another 40%. Group A is the group who report to
      // DataDog, Group B is the 2nd selection. 10% of Group B will be a
      // part of Group A, so we have to ignore them and choose others in
      // their place. This means we have to choose > 40% of the general
      // population for Group B to arrive at 40% of the population
      // who are not already in Group A.
      if (subject.isMetricsEnabledValue) {
        return true;
      }

      // Enable for an additional 11.1111% of the population.
      //
      // N = total population
      // x = % to solve for.
      //
      // .5N = .1N + (xN - .1xN)
      // /\    /\     /\   /\
      // |     |      |    |
      // |     |      |     --- Group B also in Group A
      // |     |      --------- Group B
      // |     ---------------- Group A (people reporting to DataDog)
      // ---------------------- target
      //
      // .5N = .1N + .9xN
      // .4N = .9xN
      // .4N / .9N = x
      // .4444 = x
      return this.bernoulliTrial(0.4444, subject.uniqueUserId);
    },

    groupingFunction (subject) {
      var GROUPS = ['control', 'treatment'];
      var choice = this.uniformChoice(GROUPS, subject.uniqueUserId);

      if (subject.forceExperimentGroup) {
        choice = subject.forceExperimentGroup;
      } else if (isEmailInTreatment(subject.account.get('email'))) {
        choice = 'treatment';
      }

      return {
        sendSms: choice
      };
    }
  };
});
