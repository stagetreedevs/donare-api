module.exports = ({ env }) => ({
  // ...
  email: {
    provider: 'sendgrid',
    providerOptions: {
      apiKey: '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',
    },
    settings: {
      defaultFrom: 'donareapp.dev@gmail.com',
    },
  },
  sentry: {
    dsn: 'https://62a0ce05c67e41f3bb3653c6134d087f@o1306801.ingest.sentry.io/6549803',
  }
  // ...
});
