'use strict';
const { sanitizeEntity } = require('strapi-utils');

const formatError = (error) => [{ messages: [{ id: error.id, message: error.message, field: error.field }] }];

module.exports = {
  async change(ctx) {

    // Get posted params
    const params = ctx.request.body;

    // The identifier is required.
    if (!params.identifier) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.provide',
          message: 'Please provide your username or your e-mail.',
        })
      );
    }

    // Get User based on identifier
    const user = await strapi.query('user', 'users-permissions').findOne({ email: params.identifier });

    // Validate given password against user query result password
    const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(params.password, user.password);

    if (!validPassword) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Identifier or password invalid.',
        })
      );
    } else {
      // Generate new hash password
      const password = await strapi.plugins['users-permissions'].services.user.hashPassword({ password: params.newPassword });
      // Update user password
      await strapi
        .query('user', 'users-permissions')
        .update({ id: user.id }, { resetPasswordToken: null, password });

      // Return new jwt token
      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, { model: strapi.query('user', 'users-permissions').model }),
      });
    }
  },

  async sendResetEmail(ctx) {
    const { identifier } = ctx.request.body;

    // generate code with length of 6 with numbers
    const code = Math.floor(Math.random() * 900000) + 100000;

    // Get User based on identifier
    const user = await strapi.query('user', 'users-permissions').findOne({ email: identifier });

    if (user) {
      // Update user code
      await strapi
        .query('user', 'users-permissions')
        .update({ id: user.id }, { resetPasswordToken: code });


      // Send email
      await strapi.plugins['email'].services.email.send({
        to: identifier,
        from: 'donareapp.dev@gmail.com',
        replyTo: 'donareapp.dev@gmail.com',
        subject: 'DonareApp - Reset password - ' + code,
        text: 'Your code is ' + code + '. Please use this code to reset your password. If you did not request a password reset, please ignore this email.',
        html: 'Your code is ' + code + '. Please use this code to reset your password. If you did not request a password reset, please ignore this email.',
      });

      ctx.send({
        message: 'Email sent successfully.',
      });
    }
    else {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Identifier or password invalid.',
        })
      );
    }
  },

  async resetPassword(ctx) {
    const params = ctx.request.body;
    const { code, password } = ctx.request.body;

    // Get User based on code
    const user = await strapi.query('user', 'users-permissions').findOne({ resetPasswordToken: code });

    if (user) {
      // Generate new hash password
      const newPassword = await strapi.plugins['users-permissions'].services.user.hashPassword({ password: password });
      // Update user password
      await strapi
        .query('user', 'users-permissions')
        .update({ id: user.id }, { resetPasswordToken: null, password: newPassword });

      ctx.send({
        jtw: strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, { model: strapi.query('user', 'users-permissions').model }),
      });
    }
    else {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.invalid',
          message: 'Identifier or password invalid.',
        })
      );
    }
  }
}
