'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');

module.exports = {
  async getAll(ctx) {
    const { user } = ctx.state;

    let donations_user_donor = await strapi.query('donation').find(
      {
        user_donor: user.id,
      }
    );

    // console.log(donations_user_donor.length, "donations_user_donor")

    let donations_user_receiver = await strapi.query('donation').find(
      {
        user_receiver: user.id,
      }
    );

    // console.log(donations_user_receiver.length, "donations_user_receiver")

    let donations_user_donor_receiver = donations_user_donor.concat(donations_user_receiver);

    return donations_user_donor_receiver.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  },

  // async create(ctx) {
  //   const { user } = ctx.state;
  //   const { donation } = ctx.request.body;

  //   const donation_exists = await strapi.query('donation').findOne({
  //     "product_donation": 1,
  //     "user_donor": 3,
  //     "user_receiver": 5,

  //     "status": "in_progress",
  //   });

  //   if (donation_exists) {
  //     return donation_exists;
  //   }

  //   const donation_created = await strapi.query('donation').create(donation);

  //   return donation_created;

  // }
};
