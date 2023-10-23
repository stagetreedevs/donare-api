'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {

    const user = ctx.state.user;

    const notifications_donor = await strapi.query('notifications').find({
      user_donor: user.id,
    });

    const notifications_receiver = await strapi.query('notifications').find({
      user_receiver: user.id,
    });

    const notifications = notifications_donor.concat(notifications_receiver);

    return notifications.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }
};
