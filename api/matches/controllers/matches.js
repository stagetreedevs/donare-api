'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getMyMatches(ctx) {
    const user = ctx.state.user;

    const products_donor = await strapi.query('matches').find({
      user_donor: user.id,
    });

    const products_receiver = await strapi.query('matches').find({
      user_receiver: user.id,
    });

    const products = products_donor.concat(products_receiver);

    return products.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }
};
